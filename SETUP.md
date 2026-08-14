# Kimi Source — Setup & Development Guide

> Purpose: make it fast and safe to modify this codebase and deploy it (Railway).
> Covers environment, repo map, build/test/lint, dev server, config system,
> the Tavily web-search feature, the Railway deploy cycle, and e2e verification.

---

## 1. Environment Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | `>=24.15.0` (`.nvmrc` = `24.15.0`) | `node --version` |
| pnpm | `10.33.0` (root `packageManager`) | `pnpm --version` |
| Git | any | `git --version` |

`.npmrc` sets `engine-strict=true` — install fails on the wrong Node version on purpose.

### First-time setup

```sh
# 1. Get Node 24.15 (nvm or download tarball if node is missing)
nvm use            # reads .nvmrc

# 2. Enable pnpm via corepack
corepack enable
corepack prepare pnpm@10.33.0 --activate

# 3. Install workspace deps (creates node_modules; ~8s from pnpm store)
pnpm install
```

> If the box has no `node`/`npm` at all (e.g. a Docker scratch env), download
> the Linux x64 tarball and prepend its `bin/` to `PATH`:
> `curl -sL -o node.tar.gz https://nodejs.org/dist/v24.15.0/node-v24.15.0-linux-x64.tar.gz`
> `tar -xzf node.tar.gz && export PATH="$PWD/node-v24.15.0-linux-x64/bin:$PATH"`
> (If `tar -xJ` fails it means `xz` is missing — use the `.tar.gz` build.)

---

## 2. Repository Map

pnpm monorepo. Two key areas for our deployment:

### Deployed app (`apps/kimi-code`)
- `kimi-code` CLI + web server. Entry `src/main.ts` → `src/cli/sub/web/` (the `web` subcommand).
- Bundled to `dist/main.mjs` by `tsdown` (`tsdown.config.ts`, single file, no code-splitting).
- `apps/kimi-code/dist-web/` = prebuilt browser UI (gitignored, force-added). It is **synced from an external `code-app` repo**, not edited here:
  `KIMI_CODE_REPO=<this checkout> pnpm run sync:web` (run in code-app). If missing, `scripts/check-web-assets.mjs` fails the package build.

### Server (`packages/kap-server` → `@moonshot-ai/kap-server`)
- Fastify REST + WebSocket server. Composition root: `src/start.ts` → `startServer(opts)`.
- REST routes under `/api/v1` registered in `src/routes/registerApiV1Routes.ts`.
- Debug RPC surface `/api/v1/debug/*` gated on `--debug-endpoints` (loopback bind only).
- Auth: persistent bearer token at `<KIMI_CODE_HOME>/server.token`; startup banner prints the URL with `#token=...`. `KIMI_CODE_PASSWORD` (bcrypt) also accepted.
- Key endpoints for e2e: `POST /api/v1/sessions`, `GET /api/v1/sessions/{id}`, `POST /api/v1/sessions/{id}/prompts`, `GET /api/v1/sessions/{id}/messages`.

### Agent engine v2 (`packages/agent-core-v2`)
- DI × Scope engine. Four lifecycle scopes: `app → workspace → session → agent` (`src/app/scopes.ts`).
- Tools live in `src/agent/tools/<tool>/` and register via `registerAgentToolService(...)` (collection `agent-tool`).
- Config sections register via `registerConfigSection(...)` in `src/app/config/configSectionContributions.ts`.
- Error codes: every domain exposes `XxxErrors`; aggregated into `ErrorCodes` at `src/errors.ts`.
- Import alias `#/*` → `./src/*.ts` via package.json `imports` field (root tsconfig has **no** path aliases).

### Other packages (usually not touched)
- `packages/agent-core` — v1 engine (legacy; own web-search impl under `src/tools/builtin/web/`).
- `packages/kosong` — standalone LLM/provider abstraction layer (agent-core-v2 has its own in-package port `src/kosong/`).
- `packages/klient` — contract-driven client SDK (facade over agent-core-v2).
- `packages/node-sdk` — public `@moonshot-ai/kimi-code-sdk` harness.
- `packages/{kaos, protocol, transcript, minidb, oauth, pi-tui, ...}` — infra.

### Deployment (`deploy/`)
```
deploy/
├── README.md                # Railway guide (two services)
├── llm-server/              # OpenAI-compatible proxy → free models
│   ├── src/server.js        #   /v1/models, /v1/chat/completions upstream opencode.ai/zen/v1
│   └── free-models.json     #   6 free models
└── kimi-server/
    ├── Dockerfile           # node:24-slim, builds packages + kimi-code dist
    ├── entrypoint.sh        # writes config.toml from env, then execs `kimi web`
    └── railway.json         # builder config, healthcheck /api/v1/meta
```

---

## 3. Build / Test / Lint / Typecheck

All from repo root unless noted. (`make <target>` wraps the same pnpm scripts.)

```sh
pnpm run build            # build EVERYTHING (long)
pnpm run build:packages   # only packages/*  (faster; enough for server changes)
pnpm --filter @moonshot-ai/kimi-code run build   # just the kimi-code bundle → dist/main.mjs
pnpm run test             # vitest run, all projects
pnpm run test <path>      # single file (path filter), e.g. test/app/auth/auth.test.ts
pnpm --filter @moonshot-ai/agent-core-v2 test test/app/auth/auth.test.ts  # per-package + file
pnpm run test:watch       # watch mode
pnpm run typecheck        # build:packages, then per-package tsc --noEmit (SLOW — 5+ min)
pnpm run lint             # oxlint --type-aware
pnpm run lint:fix
pnpm --filter @moonshot-ai/agent-core-v2 exec tsc -p tsconfig.json --noEmit   # fast single-package typecheck
```

Notes:
- Each package builds with **tsdown** (rolldown-based), not esbuild.
- agent-core-v2 has **codegen** that must stay in sync: `gen:config-manifest`, `gen:wire-manifest`, `gen:state-manifest`. If you change config sections/wire types, run the matching generator or its manifest test fails.
- Tests for agent-core-v2 mirror `src/` under `test/` (e.g. `test/app/auth/auth.test.ts`).
- Native SEA binary (`dist-native`) is a separate pipeline (`scripts/native/build.mjs`); not needed for Railway.

---

## 4. Dev Server (local)

```sh
pnpm dev:server       # kimi web --no-open --debug-endpoints  (loopback, tsx + raw-text loader)
pnpm dev:kap-server   # alias, same thing
pnpm dev:cli          # run the CLI interactively
```

- Default bind `127.0.0.1:58627`. Token at `~/.kimi-code/server.token`; banner prints `#token=...`.
- `--debug-endpoints` unlocks `/api/v1/debug/channels` + `/:service/:method` RPC (great for introspection).
- The browser UI needs `apps/kimi-code/dist-web`; in dev it's tolerated when `KIMI_CODE_DEV_SERVER=1`.

### Local config (`~/.kimi-code/config.toml`)

Same format Railway generates. Sample:

```toml
default_provider = "opencode"
default_model = "opencode/deepseek-v4-flash-free"

[providers.opencode]
type = "openai"
base_url = "http://127.0.0.1:8787"     # local llm-server, or Railway LLM URL
api_key = "public"
model_source = "static"

[models."opencode/deepseek-v4-flash-free"]
provider = "opencode"
model = "deepseek-v4-flash-free"
max_context_size = 1000000
display_name = "DeepSeek V4 Flash Free"
capabilities = ["tool_use", "reasoning"]

[services.moonshot_search]              # enables the WebSearch tool
base_url = "https://api.tavily.com/search"
api_key = "tvly-..."

[services.moonshot_search.tavily]
max_results = 5
search_depth = "basic"
include_answer = true
```

Local LLM proxy: `node deploy/llm-server/src/server.js` (default `127.0.0.1:8787`, upstream `https://opencode.ai/zen/v1`).

---

## 5. The Tavily Web-Search Feature (how to modify)

Flow: **config.toml `[services.moonshot_search]` → WebSearchProviderService → WebSearchTool → agent.**

### Where the code lives
| Concern | File |
|---------|------|
| `[services]` schema + snake↔camel transforms + env bindings | `packages/agent-core-v2/src/app/auth/configSection.ts` |
| Provider resolution (Tavily vs Moonshot) | `packages/agent-core-v2/src/app/auth/webSearch/webSearchService.ts` |
| **Tavily provider implementation** | `packages/agent-core-v2/src/app/auth/webSearch/providers/tavily-web-search.ts` |
| Moonshot reference provider | `packages/agent-core-v2/src/app/auth/webSearch/providers/moonshot-web-search.ts` |
| Tool contract + zod input | `packages/agent-core-v2/src/agent/tools/web-search/web-search.ts` |
| Tool impl (per-invocation provider resolve, `when:` gating) | `packages/agent-core-v2/src/agent/tools/web-search/webSearchTool.ts` |
| Error codes | `packages/agent-core-v2/src/app/web/errors.ts` (`WEB_FETCH_FAILED`), `src/app/auth/errors.ts` (`AUTH_TOKEN_MISSING`) |
| Tests | `packages/agent-core-v2/test/app/auth/auth.test.ts` (WebSearchProviderService describe block) |

### Config → provider wiring (`webSearchService.ts`)
`fromServicesConfig(config)`:
1. `[services].moonshotSearch` present?
   - `baseUrl` host is `api.tavily.com` or ends `.tavily.com` → **TavilyWebSearchProvider**, passing `options: search.tavily`.
   - otherwise → `MoonshotWebSearchProvider`.
2. else managed Kimi OAuth (`managed:kimi-code`) → Moonshot provider at `<baseUrl>/search`.

### Tavily provider (`tavily-web-search.ts`) — supported options
All map to Tavily API body fields. TOML keys are snake_case (`max_results`), camelCase internally.

- `maxResults` (1–20)
- `searchDepth` (`basic` | `advanced` | `fast` | `ultra-fast`)
- `topic` (`general` | `news` | `finance`)
- `timeRange` (`day` | `week` | `month` | `year`, or `d/w/m/y`)
- `startDate` / `endDate` (YYYY-MM-DD)
- `includeAnswer` (bool | `'basic'` | `'advanced'`) → `answer`
- `includeRawContent` (bool | `'markdown'` | `'text'`)
- `includeImages`, `includeImageDescriptions`, `includeFavicon` (bool)
- `includeDomains` / `excludeDomains` (string arrays)
- `country`, `autoParameters`, `includeUsage`

Response mapping: `content→snippet`, `published_date→date`, `site_name→siteName`, `score→score`.
HTTP 401 / non-200 → `Error2(ErrorCodes.WEB_FETCH_FAILED)`; missing key → `ErrorCodes.AUTH_TOKEN_MISSING`.

### Adding a new option (recipe)
1. Add to `TavilySearchOptionsSchema` in `configSection.ts` (camelCase).
2. Add to the snake↔camel transform if the TOML key differs.
3. Pass it through in `tavily-web-search.ts` `search()` body builder.
4. Add/update a test in `auth.test.ts` body-mapping case.
5. Run: `pnpm --filter @moonshot-ai/agent-core-v2 test test/app/auth/auth.test.ts`.
6. If schema manifests changed: `pnpm --filter @moonshot-ai/agent-core-v2 gen:config-manifest`.

---

## 6. Railway Deploy Cycle

Two services in project `free-llm-kimi`:
- **LLM proxy** (`llm-server`) — upstream to free models.
- **Kimi server** (`kimi-server`) — the app we iterate on.

### Env vars read by `deploy/kimi-server/entrypoint.sh`
| Var | Purpose | Example |
|-----|---------|---------|
| `KIMI_LLM_SERVER_URL` | LLM proxy base URL | `https://llm-server-production-b30e.up.railway.app` |
| `KIMI_DEFAULT_MODEL` | default model id | `deepseek-v4-flash-free` |
| `KIMI_API_KEY` | provider api key (default `public`) | `public` |
| `KIMI_WEB_SEARCH_API_KEY` | Tavily key → enables web search | `tvly-prod-...` |
| `PORT` | Railway sets it | `3000` |
| `KIMI_HOME` | config dir | `~/.kimi-code` |

`entrypoint.sh` writes `$KIMI_HOME/config.toml`: `[providers.opencode]`, 6 static models,
and — only when `KIMI_WEB_SEARCH_API_KEY` is set — `[services.moonshot_search]` + `[services.moonshot_search.tavily]`.
Then `exec node /app/apps/kimi-code/dist/main.mjs web --host --port "$PORT" --no-open --log-level info --allowed-host ".railway.app" --allowed-host ".up.railway.app"`.

### Full deploy loop
```sh
cd /tmp/opencode/kimi-source

# 1. Commit (Conventional Commits title, no co-author)
git add -A && git commit -m "feat: <what changed>"

# 2. Push (token in URL is fine for this workflow)
git push "https://samproc6904:<GH_TOKEN>@github.com/samproc6904/kimi-code.git" main

# 3. Trigger Railway build (env-var set auto-redeploys; or bump a dummy var / redeploy)
#    setting/updating KIMI_WEB_SEARCH_API_KEY re-deploys automatically
env -u RAILWAY_PROJECT_ID -u RAILWAY_PROJECT_NAME -u RAILWAY_SERVICE_ID \
    -u RAILWAY_SERVICE_NAME -u RAILWAY_ENVIRONMENT_ID -u RAILWAY_APP_ID \
    -u RAILWAY_APP_NAME railway variables --set "KIMI_WEB_SEARCH_API_KEY=tvly-..."

# 4. Watch deploy status
env -u RAILWAY_PROJECT_ID -u RAILWAY_PROJECT_NAME -u RAILWAY_SERVICE_ID \
    -u RAILWAY_SERVICE_NAME -u RAILWAY_ENVIRONMENT_ID -u RAILWAY_APP_ID \
    -u RAILWAY_APP_NAME railway api 'query { deployments(input: { serviceId: "168eb423-63d0-4e2b-9418-2a412a54aec5", environmentId: "49178591-4677-4251-bc24-ee2d7bd2690d" }) { edges { node { id status createdAt } } } }'

# 5. After SUCCESS: read the NEW token from logs (token rotates every deploy)
env -u RAILWAY_PROJECT_ID -u RAILWAY_PROJECT_NAME -u RAILWAY_SERVICE_ID \
    -u RAILWAY_SERVICE_NAME -u RAILWAY_ENVIRONMENT_ID -u RAILWAY_APP_ID \
    -u RAILWAY_APP_NAME railway logs | grep '#token='
```
> The `env -u RAILWAY_*` prefix is required because the CLI inherits project/service
> identifiers from the Railway web shell environment which conflict with the explicit linkage.

### Gotchas
- **The bearer token rotates on every deploy.** Old tokens return `40101` immediately. Always re-grab from logs.
- Web UI: open `https://kimi-server-production.up.railway.app/#token=<token>`.
- Healthcheck: `GET /api/v1/healthz` is auth-exempt; `/api/v1/meta` is not.

---

## 7. E2E Verification (cURL recipe)

```sh
BASE="https://kimi-server-production.up.railway.app"
TOKEN="<from logs>"

# 1. Create a session (metadata.cwd must be a real path on the server, e.g. /app)
SID=$(curl -s -X POST "$BASE/api/v1/sessions" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"metadata":{"cwd":"/app"}}' | jq -r .data.id)

# 2. Submit a prompt — content is an ARRAY, and the model field is REQUIRED
#    (without `model`, the turn silently fails in ~35ms: no AgentProfileService.bind)
curl -s -X POST "$BASE/api/v1/sessions/$SID/prompts" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"content":[{"type":"text","text":"What are the latest 2026 AI model release headlines? Use web search."}],"model":"opencode/deepseek-v4-flash-free"}'

# 3. Poll until `prompts` shows active:null, then read messages
curl -s "$BASE/api/v1/sessions/$SID/prompts" -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/api/v1/sessions/$SID/messages" -H "Authorization: Bearer $TOKEN"
```

### API shapes to remember
- Envelope: `{ code, msg, data, request_id }` — success `code:0`, errors non-zero (`40001` invalid input, `40101` unauthorized, `40409` missing workspace).
- Session list: `data.items`.
- Prompt submit success: `data.status` = `running`, contains `prompt_id`.
- Message content array types: `text`, `thinking`, `tool_use`, `tool_result`, `image`, `video`, `file`.
- Image input MUST be `{"type":"image","source":{"kind":"base64","media_type":"image/png","data":"<b64>"}}`.
  The `image_url` type is **rejected** (`40001` `content.0.type: Invalid input`).
- Model catalog: `GET /api/v1/models`.

### Verifying Tavily actually fired
After a web-search answer, inspect `messages`: an assistant message with `tool_use` followed by
`tool_result` rows whose output begins `Title: ...\nURL: ...\nSnippet: ...` — that is the Tavily
provider mapping. The answer should cite real domains (e.g. `aireleasetracker.com`).

---

## 8. Common Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `40101 Unauthorized` | Token rotated on redeploy — re-grab from `railway logs` `#token=` |
| Turn fails in ~35ms, `lastTurn.reason=failed` | Prompt missing `model` (or `profile`) — no bind, no LLM call |
| `40001 content: expected array` | `content` must be an array of content blocks |
| `40001 content.0.type` invalid | Used `image_url` — use `image` + `source.kind=base64` |
| `metadata.cwd` required / `workspace root ... does not exist` | `POST /sessions` needs `metadata.cwd` pointing at a real server path |
| WebSearch tool never activates | `KIMI_WEB_SEARCH_API_KEY` unset (or no `[services.moonshot_search]`) — tool is gated on provider existence |
| `pnpm install` fails on engine | Node must be `>=24.15.0` |
| Config change not picked up | Config precedence: default → config.toml → env overlay → memory. Env vars win over the file. |

---

## 9. Reference Cheat-Sheet

- Root scripts: see `package.json` `scripts` (build, typecheck, lint, test, dev:*).
- Makefile: `prepare/build/typecheck/lint/test/dev/release`.
- CI: `.github/workflows/ci.yml` (build/test/lint/typecheck), `release.yml` (changesets → npm).
- Flake: `flake.nix` — if you ADD/REMOVE a workspace package, update `pnpm-workspace.yaml` AND `flake.nix` (`workspacePaths` + `workspaceNames`).
- Import style: prefer `import ... from '#/...'`.
- Optional props: pass `undefined` directly, no conditional spread.
- Skills for TUI / agent-core-v2 work: `.agents/skills/write-tui/SKILL.md`, `.agents/skills/agent-core-dev/SKILL.md`, `.agents/skills/gen-changesets/SKILL.md` (run before PRs).
