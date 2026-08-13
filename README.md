# KimiOm - VS Code with AI Models

Browser-based VS Code with integrated AI models (no login required).

## Features
- VS Code in browser (code-server)
- 4 free AI models via LLM proxy
- Continue extension for AI chat
- Cloudflare tunnel for public access

## Quick Start

### 1. Start LLM Proxy
```bash
cd llm-proxy
node server.mjs
```

### 2. Start Code Server
```bash
export PASSWORD=omvs2026
export PORT=9090
/tmp/code-server-4.100.0-linux-amd64/bin/code-server --bind-addr 0.0.0.0:9090 --auth password --disable-telemetry
```

### 3. Start Cloudflare Tunnel
```bash
/tmp/cloudflared tunnel --url http://localhost:9090
```

## Available Models
| Model | ID | Context |
|-------|-----|---------|
| Big Pickle | opencode/big-pickle | 32K |
| DeepSeek V4 Flash | opencode/deepseek-v4-flash-free | 131K |
| Nemotron 3 Ultra | opencode/nemotron-3-ultra-free | 131K |
| Mimo v2.5 | opencode/mimo-v2.5-free | 32K |

## Configuration
- **LLM Proxy Port:** 4000
- **Code Server Port:** 9090
- **Password:** omvs2026
- **Upstream:** https://llm-server-production-b30e.up.railway.app

## OmVs Source Code
The `OmVs/` directory contains VS Code + Copilot Chat extension source code with BYOK (Bring Your Own Key) patches.

### Building VS Code (Optional)
```bash
cd OmVs/vscode
npm install
./scripts/code-web.js
```

### Copilot BYOK Patch
Modified file: `OmVs/vscode-copilot-chat/src/extension/byok/common/byokProvider.ts`
- `isBYOKEnabled()` always returns `true`
- Enables custom model usage without GitHub login
