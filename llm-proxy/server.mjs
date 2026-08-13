import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = 4000;
const UPSTREAM = 'https://llm-server-production-b30e.up.railway.app';

const MODELS = [
  { id: 'opencode/big-pickle', title: 'Big Pickle', upstream: 'big-pickle', context: 32768 },
  { id: 'opencode/deepseek-v4-flash-free', title: 'DeepSeek V4 Flash', upstream: 'deepseek-v4-flash-free', context: 131072 },
  { id: 'opencode/nemotron-3-ultra-free', title: 'Nemotron 3 Ultra', upstream: 'nemotron-3-ultra-free', context: 131072 },
  { id: 'opencode/mimo-v2.5-free', title: 'Mimo v2.5 (Multimodal)', upstream: 'mimo-v2.5-free', context: 32768 },
];

function mapModel(id) {
  const m = MODELS.find(m => m.id === id);
  return m ? m.upstream : id;
}

function proxy(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    let url = req.url;
    let sendBody = body;

    if (url === '/v1/models' && req.method === 'GET') {
      const modelsList = MODELS.map(m => ({
        id: m.id,
        object: 'model',
        created: Date.now(),
        owned_by: 'omvs',
        permission: [{ id: 'modelperm-' + m.id.replace(/\//g, '-'), object: 'model_permission', created: Date.now(), allow_create_engine: false, allow_sampling: true, allow_logprobs: true, allow_search_indices: false, allow_view: true, allow_fine_tuning: false, organization: '*', group: null, is_blocking: false }],
        root: m.id,
        parent: null
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ object: 'list', data: modelsList }));
      return;
    }

    // Health check
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', models: MODELS.map(m => m.id) }));
      return;
    }

    if (body) {
      try {
        const parsed = JSON.parse(body);
        if (parsed.model) parsed.model = mapModel(parsed.model);
        sendBody = JSON.stringify(parsed);
      } catch(e) {}
    }

    const target = new URL(url, UPSTREAM);
    const options = {
      hostname: target.hostname,
      port: 443,
      path: target.pathname + target.search,
      method: req.method,
      headers: { ...req.headers, host: target.hostname }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: e.message, type: 'proxy_error' } }));
    });

    if (sendBody) proxyReq.write(sendBody);
    proxyReq.end();
  });
}

const server = http.createServer(proxy);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OmVs LLM Proxy running on http://0.0.0.0:${PORT}`);
  console.log(`📋 ${MODELS.length} models available`);
  MODELS.forEach(m => console.log(`   - ${m.id}: ${m.title}`));
});
