import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const UPSTREAM = process.env.UPSTREAM_BASE_URL ?? 'https://opencode.ai/zen/v1';
const MODELS_DEV_URL = process.env.MODELS_DEV_URL ?? 'https://models.dev/api.json';
const MODELS_DEV_PROVIDER = process.env.MODELS_DEV_PROVIDER ?? 'opencode';
const PORT = Number(process.env.PORT ?? process.env.LLM_PORT ?? 8787);
const HOST = process.env.HOST ?? '0.0.0.0';
const MAX_RESPONSE_TOKENS = Number(process.env.MAX_RESPONSE_TOKENS ?? 8192);

const STATIC_MODELS = JSON.parse(
  readFileSync(join(__dirname, '..', 'free-models.json'), 'utf8'),
).models;

let catalog = { ...STATIC_MODELS };
let catalogSource = 'static';

async function loadCatalog() {
  try {
    const res = await fetch(MODELS_DEV_URL, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    const data = JSON.parse(text);
    const models = data[MODELS_DEV_PROVIDER]?.models;
    if (models && typeof models === 'object' && Object.keys(models).length > 0) {
      catalog = { ...models, ...STATIC_MODELS };
      catalogSource = `${MODELS_DEV_PROVIDER}@models.dev`;
      console.log(
        `[llm-server] catalog loaded from models.dev (${Object.keys(models).length} models, ${catalogSource})`,
      );
      return;
    }
    throw new Error(`provider "${MODELS_DEV_PROVIDER}" has no models in ${MODELS_DEV_URL}`);
  } catch (err) {
    console.log(`[llm-server] models.dev fetch failed (${err.message}); using static fallback`);
  }
  console.log(`[llm-server] using static fallback catalog (${Object.keys(STATIC_MODELS).length} models)`);
}

function resolveUpstream(modelId) {
  return STATIC_MODELS[modelId]?.upstream ?? UPSTREAM;
}

function resolveModelApiKey(modelId) {
  const envName = STATIC_MODELS[modelId]?.api_key_env;
  if (envName) return process.env[envName] ?? '';
  return null;
}

function sendJson(res, status, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(payload);
}

function resolveApiKey(req) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    if (token && token.length > 0) return token;
  }
  return process.env.OPENCODE_API_KEY ?? 'public';
}

function listModelsWire() {
  return {
    object: 'list',
    data: Object.keys(catalog).map((id) => ({
      id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'opencode',
    })),
  };
}

function modelInfoWire(id) {
  const m = catalog[id];
  if (!m) return null;
  return {
    id,
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'opencode',
    display_name: m.name,
    description: m.description,
    limit: m.limit ?? {},
    reasoning: m.reasoning ?? false,
    tool_call: m.tool_call ?? false,
    attachment: m.attachment ?? false,
    reasoning_options: m.reasoning_options ?? [],
    modalities: m.modalities ?? { input: ['text'], output: ['text'] },
    cost: m.cost,
  };
}

async function handleChatCompletions(req, res) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  console.log(`[llm-server] chat/completions model=${JSON.parse(raw || '{}').model} stream=${JSON.parse(raw || '{}').stream}`);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    sendJson(res, 400, { error: { message: 'Invalid JSON body', type: 'invalid_request_error' } });
    return;
  }

  const model = body.model;
  const modelInfo = catalog[model];
  if (!modelInfo) {
    sendJson(res, 400, {
      error: {
        message: `Model "${model}" is not in the catalog (${catalogSource}). Available: ${Object.keys(catalog).length} models`,
        type: 'invalid_request_error',
      },
    });
    return;
  }

  const wantStream = body.stream === true;
  const target = `${resolveUpstream(model)}/chat/completions`;

  const outbound = { ...body, stream: wantStream };
  const outputLimit = modelInfo.limit?.output;
  if (outbound.max_tokens === undefined || outbound.max_tokens > MAX_RESPONSE_TOKENS) {
    outbound.max_tokens = MAX_RESPONSE_TOKENS;
  }
  if (outputLimit && outbound.max_tokens > outputLimit) {
    outbound.max_tokens = outputLimit;
  }

  const modelApiKey = resolveModelApiKey(model);
  const outboundHeaders = {
    Authorization: `Bearer ${modelApiKey ?? resolveApiKey(req)}`,
    'Content-Type': 'application/json',
    Accept: req.headers['accept'] ?? 'application/json',
    'User-Agent': 'opencode-llm-server/1.1',
  };

  let upstreamRes;
  try {
    upstreamRes = await fetch(target, {
      method: 'POST',
      headers: outboundHeaders,
      body: JSON.stringify(outbound),
    });
  } catch (err) {
    sendJson(res, 502, { error: { message: `Upstream error: ${err.message}`, type: 'upstream_error' } });
    return;
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
  };

  res.writeHead(upstreamRes.status, headers);

  if (upstreamRes.body) {
    const reader = upstreamRes.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return;
  }

  try {
    if (req.method === 'GET' && (path === '/v1/models' || path === '/models')) {
      sendJson(res, 200, listModelsWire());
      return;
    }

    if (req.method === 'GET' && path.startsWith('/v1/models/')) {
      const id = decodeURIComponent(path.split('/').pop());
      const info = modelInfoWire(id);
      if (!info) {
        sendJson(res, 404, { error: { message: `Model "${id}" not found`, type: 'not_found_error' } });
        return;
      }
      sendJson(res, 200, info);
      return;
    }

    if (req.method === 'POST' && (path === '/v1/chat/completions' || path === '/chat/completions')) {
      console.log(`[llm-server] POST ${path} from ${req.headers.host ?? 'unknown'}`);
      await handleChatCompletions(req, res);
      console.log(`[llm-server] POST ${path} -> done`);
      return;
    }

    if (req.method === 'GET' && (path === '/v1/responses' || path === '/responses')) {
      console.log(`[llm-server] GET ${path} (responses) from ${req.headers.host ?? 'unknown'}`);
      sendJson(res, 200, { data: [] });
      return;
    }

    if (req.method === 'POST' && (path === '/v1/responses' || path === '/responses')) {
      console.log(`[llm-server] POST ${path} (responses) — not implemented`);
      sendJson(res, 404, { error: { message: 'responses API not implemented; use chat/completions', type: 'not_found_error' } });
      return;
    }

    console.log(`[llm-server] ${req.method} ${path} from ${req.headers.host ?? 'unknown'} -> 404`);

    sendJson(res, 404, {
      error: { message: `Not found: ${req.method} ${path}`, type: 'not_found_error' },
    });
  } catch (err) {
    sendJson(res, 500, { error: { message: `Internal error: ${err.message}`, type: 'server_error' } });
  }
});

await loadCatalog();
setInterval(loadCatalog, 60 * 60 * 1000).unref();

server.listen(PORT, HOST, () => {
  console.log(`[llm-server] opencode model proxy listening on http://${HOST}:${PORT}`);
  console.log(`[llm-server] upstream: ${UPSTREAM}`);
});
