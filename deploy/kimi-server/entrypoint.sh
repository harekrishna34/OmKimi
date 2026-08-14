#!/bin/sh
# Kimi Code web entrypoint.
# Generates ~/.kimi-code/config.toml from KIMI_LLM_SERVER_URL, then serves kimi web.
set -e

KIMI_HOME="${KIMI_HOME:-$HOME/.kimi-code}"
mkdir -p "$KIMI_HOME"

# Prefer the Railway persistent volume for all persisted state (sessions,
# chats, config, tokens) so redeploys/restarts keep the history and the
# server token stays stable.
if [ -n "${KIMI_VOLUME_DIR:-}" ] && [ -d "$KIMI_VOLUME_DIR" ]; then
  KIMI_HOME="$KIMI_VOLUME_DIR"
  export KIMI_CODE_HOME="$KIMI_VOLUME_DIR"
  mkdir -p "$KIMI_HOME"
  echo "[entrypoint] persistent volume: $KIMI_HOME"
fi

LLM_URL="${KIMI_LLM_SERVER_URL:-http://127.0.0.1:8787}"
LLM_URL="${LLM_URL%/}"
PORT="${PORT:-3000}"

# Default free model; overridable.
DEFAULT_MODEL="${KIMI_DEFAULT_MODEL:-deepseek-v4-flash-free}"

# Model auto-selected when a prompt carries media the default model cannot
# accept (image/audio/video). Must name a configured model key; leave unset to
# fall back to the first capable model in config.
MEDIA_MODEL="${KIMI_MEDIA_MODEL:-opencode/mimo-v2.5-free}"

cat > "$KIMI_HOME/config.toml" <<EOF
# Generated at container start — managed by deploy/kimi-server/entrypoint.sh
default_provider = "opencode"
default_model = "opencode/$DEFAULT_MODEL"

[providers.opencode]
type = "openai"
base_url = "$LLM_URL"
api_key = "${KIMI_API_KEY:-public}"
model_source = "static"

[providers.nvidia]
type = "openai"
base_url = "https://integrate.api.nvidia.com/v1"
api_key = "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"
model_source = "static"

[models."opencode/big-pickle"]
provider = "opencode"
model = "big-pickle"
max_context_size = 200000
display_name = "Big Pickle"
capabilities = ["tool_use", "reasoning"]

[models."opencode/deepseek-v4-flash-free"]
provider = "opencode"
model = "deepseek-v4-flash-free"
max_context_size = 200000
display_name = "DeepSeek V4 Flash Free"
capabilities = ["tool_use", "reasoning"]

[models."opencode/laguna-s-2.1-free"]
provider = "opencode"
model = "laguna-s-2.1-free"
max_context_size = 256000
display_name = "Laguna S 2.1 Free"
capabilities = ["tool_use", "reasoning"]

[models."opencode/longcat-2.0-free"]
provider = "opencode"
model = "longcat-2.0-free"
max_context_size = 1000000
display_name = "LongCat-2.0 Free"
capabilities = ["tool_use", "reasoning"]

[models."opencode/mimo-v2.5-free"]
provider = "opencode"
model = "mimo-v2.5-free"
max_context_size = 200000
display_name = "MiMo V2.5 Free"
capabilities = ["tool_use", "reasoning", "image_in"]

[models."opencode/nemotron-3-ultra-free"]
provider = "opencode"
model = "nemotron-3-ultra-free"
max_context_size = 1000000
display_name = "Nemotron 3 Ultra Free"
capabilities = ["tool_use", "reasoning"]

[models."nvidia/nemotron-ultra"]
provider = "nvidia"
model = "nvidia/nemotron-3-ultra-550b-a55b"
max_context_size = 131072
max_output_tokens = 8192
display_name = "NVIDIA Nemotron 3 Ultra 550B"
capabilities = ["tool_use", "reasoning"]

[subagent_models]
models = [
  "opencode/big-pickle",
  "opencode/deepseek-v4-flash-free",
  "opencode/laguna-s-2.1-free",
  "opencode/longcat-2.0-free",
  "opencode/mimo-v2.5-free",
  "opencode/nemotron-3-ultra-free",
  "nvidia/nemotron-ultra",
]
EOF

if [ -n "${KIMI_WEB_SEARCH_API_KEY:-}" ]; then
  cat >> "$KIMI_HOME/config.toml" <<EOF

[services.moonshot_search]
base_url = "https://api.tavily.com/search"
api_key = "$KIMI_WEB_SEARCH_API_KEY"

[services.moonshot_search.tavily]
max_results = 5
search_depth = "basic"
include_answer = true
EOF
fi

if [ -n "${KIMI_BROWSER_MCP_URL:-}" ]; then
  cat > "$KIMI_HOME/mcp.json" <<EOF
{
  "mcpServers": {
    "browseros": {
      "transport": "http",
      "url": "$KIMI_BROWSER_MCP_URL"
    }
  }
}
EOF
  echo "[entrypoint] MCP_ENABLED=yes wrote $KIMI_HOME/mcp.json url=$KIMI_BROWSER_MCP_URL"
else
  echo "[entrypoint] MCP_ENABLED=no (KIMI_BROWSER_MCP_URL not set)"
fi

echo "[entrypoint] wrote $KIMI_HOME/config.toml"
echo "[entrypoint] LLM server: $LLM_URL  default_model: $DEFAULT_MODEL  media_model: $MEDIA_MODEL"

# Railway provides PORT; kimi web binds to it on 0.0.0.0.
exec node /app/apps/kimi-code/dist/main.mjs web --host --port "$PORT" --no-open --log-level info --allowed-host ".railway.app" --allowed-host ".up.railway.app"
