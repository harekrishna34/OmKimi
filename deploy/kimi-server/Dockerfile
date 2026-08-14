# Kimi Code web server — built from source, deployed on Railway.
# LLM server (free-models proxy) URL must be provided as KIMI_LLM_SERVER_URL.

FROM node:24-slim AS base

# Native addons (node-pty) need python/make/g++ during pnpm install.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json vitest.config.ts ./
COPY apps ./apps
COPY packages ./packages
COPY plugins ./plugins
COPY scripts ./scripts
COPY build ./build

FROM base AS build
RUN pnpm install --frozen-lockfile
RUN pnpm run build:packages
RUN pnpm --filter @moonshot-ai/kimi-code run build

FROM node:24-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# node-pty needs the dynamic linker to find its .node — copy full node_modules.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/kimi-code/dist ./apps/kimi-code/dist
COPY --from=build /app/apps/kimi-code/dist-web ./apps/kimi-code/dist-web
COPY --from=build /app/apps/kimi-code/package.json ./apps/kimi-code/package.json
COPY --from=build /app/apps/kimi-code/native ./apps/kimi-code/native
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/kimi-code/scripts ./apps/kimi-code/scripts

COPY deploy/kimi-server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=3000
EXPOSE 3000

CMD ["/entrypoint.sh"]
