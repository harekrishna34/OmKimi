# Kimi Code — Full Architecture & Change-Impact Map

> Auto-generated from codebase analysis. Read this to understand: what each part does, and **where a change applies**.

---

## 1. Entrypoints (`apps/kimi-code/`)

| File | Role | Change Impact |
|------|------|---------------|
| `src/main.ts` | `kimi` bin entry — Commander program, crash handlers, SEA workers | Global: affects ALL surfaces (TUI, web, headless) |
| `src/cli/commands.ts` | CLI tree — TUI shell, `-p` headless, `web`, `vis`, `acp`, `login` | CLI flags/options for all modes |
| `src/cli/sub/web/` | `kimi web` → starts kap-server in-process | Web server only (port, host, auth, flags) |
| `src/cli/run-shell.ts` | Boots TUI via SDK KimiHarness | TUI boot flow only |
| `src/cli/run-prompt.ts` | Headless `-p` mode | Headless mode only |
| `src/tui/` | Terminal UI (kimi-tui.ts coordinator, controllers, components) | TUI only — messages, dialogs, theme |
| `src/tui/commands/web.ts` | `/web` slash command — TUI→Web handoff | TUI↔Web bridge |

---

## 2. Agent Engines

| Package | Role | Status | Change Impact |
|---------|------|--------|---------------|
| `packages/agent-core/` | v1 engine — monolithic `Agent`+`Session` classes, VSCode DI | Production | Legacy; still used by some paths |
| `packages/agent-core-v2/` | v2 engine — DI Scope tree (App/Workspace/Session/Agent), Service/Fiber units | WIP (kap-server uses this) | **Core**: tool, config, session, permission, plan changes |
| `agent-core-v2/src/app/scopes.ts` | 4 LifecycleScope tiers | — | Scope topology (rarely changes) |
| `agent-core-v2/src/_base/di/` | DI kernel — scope, service, fiber, collection, cascade | — | DI/infra changes (rare) |
| `agent-core-v2/src/features/` | Feature units (plan is first ported) | — | Feature toggles |
| `agent-core-v2/src/app/workspaceLifecycle/` | `handlerFor` → session lookup | — | Session addressing logic |

### v1 vs v2 Differences
- **v1**: Direct method calls, singleton DI, domain code persists directly
- **v2**: Event bus, scoped DI, cascade transactions, access-pattern stores (IAppendLogStore, IAtomicDocumentStore, IBlobStore, IQueryStore)

---

## 3. Server & Client

| Package | Role | Change Impact |
|---------|------|---------------|
| `packages/kap-server/src/start.ts` | `startServer()` — Fastify REST+WS, auth, engine bootstrap | **Core**: server boot, auth, routing |
| `packages/kap-server/src/routes/` | `/api/v1/*` routes (sessions, config, workspace, search, fs, etc.) | REST API surface |
| `packages/kap-server/src/routes/registerApiV1Routes.ts` | Route registration | Add/remove routes |
| `packages/kap-server/src/middleware/auth.ts` | Bearer token + password gate | Auth behavior |
| `packages/kap-server/src/search/` | Global search (MiniDb-backed, worker-hosted) | Search behavior |
| `packages/klient/` | Client SDK facade (ipc/memory transports) | Client API contract |
| `packages/kosong/` | LLM abstraction — `ChatProvider`, adapters (kimi/openai/anthropic/google) | LLM provider behavior |
| `packages/oauth/` | Device Code Flow (RFC 8628) against auth.kimi.com | Login/auth flow |

### Key Routes (`/api/v1/`)
- **Lifecycle**: `meta`, `sessions`, `messages`, `transcript`, `prompts`, `approvals`, `questions`, `skills`, `tools`, `tasks`
- **Config**: `config`, `modelCatalog`, `oauth`, `auth`
- **Filesystem**: `workspaces`, `workspaceFs`, `fs`, `files`, `guiStore`
- **Misc**: `search`, `terminals`, `shutdown`, `connections`, `webAssets`
- **Debug**: `debug/*` (reflection RPC, gated by `--debug-endpoints`)

---

## 4. Infrastructure Packages

| Package | Role | Change Impact |
|---------|------|---------------|
| `packages/kaos/` | Execution environment (LocalKaos + SSHKaos) | File/process abstraction |
| `packages/transcript/` | Transcript data layer (L1-L4), sole owner of transcript contracts | WS fan-out, transcript rendering |
| `packages/minidb/` | Embedded JSON store (WAL + snapshots + generations) | Search index persistence |
| `packages/telemetry/` | Client telemetry (1000-event queue, ships to telemetry-logs.kimi.com) | Analytics/usage tracking |
| `packages/node-sdk/` | Public SDK — `KimiHarness`, `createKimiHarnessV2` | Public API surface |
| `packages/tree-sitter-bash/` | Pure-TS bash parser (command-permission analysis) | Command safety gating |
| `packages/protocol/` | Wire schemas (REST+WS, zod + ulid) | API contract types |

---

## 5. Deploy (`deploy/`)

| File | Role | Change Impact |
|------|------|---------------|
| `deploy/kimi-server/entrypoint.sh` | Production config generation (`config.toml` from env) | Production behavior |
| `deploy/kimi-server/Dockerfile` | 2-stage build (node:24-slim + pnpm) | Production image |
| `deploy/kimi-server/railway.json` | Railway service config | Deploy config |
| `deploy/llm-server/src/server.js` | OpenAI-compatible free-models proxy | LLM proxy behavior |
| `deploy/llm-server/free-models.json` | Model allowlist (6 free models) | Available models |

### Production Flow
1. `entrypoint.sh` writes `config.toml` from env vars
2. Starts `kimi web --host --port $PORT`
3. Token persisted on Railway volume (`/data`) — survives redeploys
4. LLM requests → `llm-server` → upstream `opencode.ai/zen/v1`

### ⚠️ Known Issue
`deploy/kimi-server/railway.json` has `healthcheckPath: /api/v1/meta` which **requires auth** and fails Railway healthcheck. `deploy/README.md` explicitly says use `/api/v1/healthz` instead. The committed json is stale/dangerous.

---

## 6. Change-Impact Matrix

> When you change X, here's what breaks/needs updating:

| Change | Where It Applies |
|--------|-----------------|
| Add a **new model** | `deploy/llm-server/free-models.json` (proxy allowlist) + `deploy/kimi-server/entrypoint.sh` (config.toml models block) + `config.toml` providers |
| Add a **new tool** | `agent-core-v2/src/agent/tools/<tool>/` → registers via `registerAgentToolService` → appears in `/api/v1/tools` |
| Add a **new route** | `kap-server/src/routes/` → register in `registerApiV1Routes.ts` → expose in OpenAPI |
| Add a **new config section** | `agent-core-v2` via `registerConfigSection` → appears in `/api/v1/config` |
| Change **auth flow** | `packages/oauth/` (device flow) + `kap-server/src/middleware/auth.ts` (bearer gate) |
| Change **TUI UI** | `apps/kimi-code/src/tui/` (components, controllers, theme) — web untouched |
| Change **Web UI** | External `code-app` repo → bundled as `apps/kimi-code/dist-web/` — TUI untouched |
| Change **search** | `kap-server/src/search/` + `packages/minidb/` — affects @ file mentions |
| Change **transcript** | `packages/transcript/` — affects WS fan-out to ALL connected clients |
| Change **telemetry** | `packages/telemetry/` — affects analytics only |
| Change **CLI flags** | `apps/kimi-code/src/cli/options.ts` + `commands.ts` |
| Change **deploy config** | `deploy/kimi-server/railway.json` + `entrypoint.sh` + Dockerfile |

---

## 7. Data Flow

```
User (TUI/Web/Headless)
  ↓
apps/kimi-code (CLI entrypoint)
  ↓
packages/kap-server (REST + WS)
  ↓
packages/agent-core-v2 (DI Scope engine)
  ↓
packages/kosong (LLM abstraction) → llm-server proxy → opencode.ai/zen/v1
  ↓
packages/kaos (execution: local/SSH)
  ↓
packages/tree-sitter-bash (command safety)
```

**Persistence**:
- Sessions/chats/config → `KIMI_HOME` (Railway volume `/data`)
- Search index → `<home>/search-index` (MiniDb)
- Telemetry → `telemetry-logs.kimi.com`
