# Railway Deploy — OpenCode Free LLM + Kimi Code

Live project: **kimi-free-nonus** (region `sin` = Singapore, env `production`)
Repo: **samproc6904/kimi-code** (branch `main`)

Two services (this project has no browseros-agent). Build order matters —
deploy the ones nothing else depends on first:

```
1. llm-server      (OpenAI proxy for free models)   — nobody depends on it
2. kimi-server     (web UI)                         — depends on 1
```

Current service matrix (2026-08):

| Service | Public URL | Source dir | Notes |
|---|---|---|---|
| `llm-server` | `https://llm-server-production-2d63.up.railway.app/v1` | `deploy/llm-server` | Dockerfile builder |
| `kimi-server` | `https://kimi-server-production-dced.up.railway.app` | `deploy/kimi-server` | volume at `/data`, token `PoJ9gG35YdoaE_pIkypA6hWUN0Ic9gqhCCTLTA4Ydps` |

Legacy project **free-llm-kimi** (region `sfo`) still runs the same stack with
an extra optional `browseros-agent` (`https://browseros-agent-production.up.railway.app/mcp`)
and its own kimi-server (`https://kimi-server-production.up.railway.app`, token
`bHvCQnbqnmYjHNLFOKhwVYQZKHfE9uuJeO7-PBLzcj8`).

---

## 1. LLM Server (provider proxy) — build first

- Directory: `deploy/llm-server`, Dockerfile builder via `railway.json`.
- Serves only the **working** OpenCode Zen free models over an
  OpenAI-compatible API (`/v1/models`, `/v1/chat/completions`, streaming).
- Upstream: `https://opencode.ai/zen/v1` (free models work without a key).
- Env (all optional):
  - `UPSTREAM_BASE_URL` — override the Zen upstream (default as above)
  - `OPENCODE_API_KEY` — token when the upstream requires one
  - `PORT` / `LLM_PORT` — listen port (default `8787`; Railway injects `PORT`)
- Set one dummy variable (e.g. `DEPLOY_TRIGGER=1`) to force a redeploy when
  the service is not repo-linked.

Verify after deploy:

```
curl https://<llm-domain>/v1/models
curl https://<llm-domain>/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"deepseek-v4-flash-free","messages":[{"role":"user","content":[{"type":"text","text":"hi"}]}]}'
```

## 2. browseros-agent (optional MCP) — build second

- External service (bun runtime, serves `/mcp`); not built from this repo.
- No custom env required for the proxy to work. Grab its public URL:
  `https://<browseros-domain>/mcp` and wire it into kimi-server below.

## 3. Kimi Server (web UI) — build last, after 1 and 2

- Directory: `deploy/kimi-server` — builds kimi from source (pnpm) and runs
  `entrypoint.sh` → `node apps/kimi-code/dist/main.mjs web ...`.
- **Attach a persistent volume** at `/data` (project has `kimi-server-volume`,
  48.8 GB). This is what keeps chats/sessions and the auth token across
  redeploys/restarts.
- Env:
  - `KIMI_LLM_SERVER_URL` → **required** — the llm-server public URL with
    `/v1` suffix, e.g. `https://llm-server-production-2d63.up.railway.app/v1`
  - `KIMI_VOLUME_DIR` → `/data` (entrypoint redirects `KIMI_HOME` /
    `KIMI_CODE_HOME` to it so sessions + `server.token` persist)
  - `KIMI_BROWSER_MCP_URL` → optional — `https://<browseros-domain>/mcp`
  - `KIMI_DEFAULT_MODEL` → optional (default `deepseek-v4-flash-free`)
  - `KIMI_MEDIA_MODEL` → optional (default `opencode/mimo-v2.5-free`)
  - `KIMI_API_KEY` → optional (default `public`; proxy ignores it)
  - `KIMI_WEB_SEARCH_API_KEY` → optional — Tavily key for `/websearch`
  - `PORT` → `3000` (Railway injects it)
- Healthcheck: `/api/v1/healthz` (public). Do NOT use `/api/v1/meta` — it
  requires the bearer token and the healthcheck is unauthenticated, so a
  token-required path fails the Railway healthcheck (HTTP 401, deploy FAILED).
- On boot `entrypoint.sh` writes `<volume>/config.toml` pointing the `opencode`
  provider at the LLM server and marks it as the default provider.

### Access / token

- The bearer token is written to `<volume>/server.token` on first boot and
  **never regenerates** while the volume is attached. After a redeploy the
  token stays the same, so bookmark this once:
  `https://<kimi-domain>/#token=<token>` (token appears in the startup banner).
- To mint a new token on purpose: `kimi web rotate-token` (rewrites the file).

---

## Deploy gotchas (learnt the hard way)

- Root `.gitignore` has a bare `Dockerfile` pattern → excludes **all**
  Dockerfiles from `railway up`. Always upload with `--no-gitignore`.
- kimi-server builds from the repo root (its Dockerfile `COPY`s repo-root
  paths like `apps`, `pnpm-workspace.yaml`): set service `rootDirectory` to
  `""` (repo root) and `dockerfilePath` to `deploy/kimi-server/Dockerfile`.
  llm-server inverts this: rootDirectory `deploy/llm-server` + `Dockerfile`.
- Railway healthcheck is unauthenticated → it must hit a public route. See the
  `/api/v1/healthz` note above; a token-gated path makes the deploy FAIL even
  though the app boots fine.

## Redeploy workflow (this project)

- kimi-server is not repo-linked here — force a redeploy by bumping a dummy
  variable: `railway variable set DEPLOY_TRIGGER=<n> --service <kimi-service-id>`
- Confirm with `railway service status --service <id>` until `SUCCESS`, then
  check logs for `[entrypoint] persistent volume: /data` and `server ready`.

## Free models served

big-pickle, deepseek-v4-flash-free (default), laguna-s-2.1-free,
longcat-2.0-free, mimo-v2.5-free (image-capable), nemotron-3-ultra-free.

Upstream TTFB varies a lot (deepseek-v4-flash-free ~12 s, laguna-s-2.1-free
and nemotron-3-ultra-free ~6–7 s); pick the default model with
`KIMI_DEFAULT_MODEL` if the default feels slow.
