/**
 * Platform adapter launcher — connects messaging platforms to kap-server.
 *
 * RUN: KIMI_PLATFORM_ALL=true npx tsx scripts/platform-runner.ts
 *
 * TOKEN SOURCES (checked in order, first non-empty wins):
 *   1. Environment variables (KIMI_TELEGRAM_BOT_TOKEN, etc.)
 *   2. Config file: ./platform-tokens.json (or PLATFORM_TOKENS_FILE env)
 *
 * ENV VARS:
 *   KIMI_PLATFORM_ALL=true           — enable all platforms
 *   KIMI_PLATFORM_TELEGRAM=true      — enable Telegram
 *   KIMI_PLATFORM_DISCORD=true       — enable Discord
 *   KIMI_PLATFORM_SLACK=true         — enable Slack
 *   KIMI_PLATFORM_EMAIL=true         — enable Email
 *   KIMI_PLATFORM_VOICE=true         — enable Voice
 *   KIMI_SERVER_URL                  — kap-server URL (default: http://127.0.0.1:58627)
 *   KIMI_CODE_TOKEN                  — kap-server auth token
 *
 * CONFIG FILE (platform-tokens.json):
 *   {
 *     "telegram": { "token": "BOT_TOKEN", "allowedUsers": ["123"] },
 *     "discord": { "token": "BOT_TOKEN" },
 *     "slack": { "botToken": "xoxb-...", "appToken": "xapp-...", "signingSecret": "..." },
 *     "email": { "address": "you@example.com", "password": "app-password", "imapHost": "imap.gmail.com", "smtpHost": "smtp.gmail.com" },
 *     "voice": { "openaiKey": "sk-..." }
 *   }
 *
 * HEALTH CHECK: GET http://localhost:$PORT/health
 *   Returns JSON with adapter statuses.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

// ── Adapters ────────────────────────────────────────────────────────────────
import { createTelegramAdapter } from '../packages/platform-telegram/src/index.js';
import { createDiscordAdapter } from '../packages/platform-discord/src/index.js';
import { createSlackAdapter } from '../packages/platform-slack/src/index.js';
import { createEmailAdapter } from '../packages/platform-email/src/index.js';
import { createVoiceAdapter } from '../packages/platform-voice/src/index.js';
import type { BasePlatformAdapter } from '../packages/platform-adapter/src/index.js';

// ── Config file loading ─────────────────────────────────────────────────────
interface TokenConfig {
  telegram?: { token?: string; allowedUsers?: string[]; allowAll?: boolean };
  discord?: { token?: string };
  slack?: { botToken?: string; appToken?: string; signingSecret?: string };
  email?: { address?: string; password?: string; imapHost?: string; smtpHost?: string };
  voice?: { openaiKey?: string };
}

function loadConfigFile(): TokenConfig {
  const filePath = process.env.PLATFORM_TOKENS_FILE ?? join(process.cwd(), 'platform-tokens.json');
  if (!existsSync(filePath)) return {};
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as TokenConfig;
  } catch (err) {
    console.error(`[kimi-platforms] Failed to load config file: ${err}`);
    return {};
  }
}

/** Get env var or fall back to config file value */
function getToken(envKey: string, configValue: string | undefined): string | undefined {
  const envVal = process.env[envKey];
  if (envVal && envVal.length > 0) return envVal;
  if (configValue && configValue.length > 0) return configValue;
  return undefined;
}

// ── Adapter factory ─────────────────────────────────────────────────────────
function buildAdapterEnv(platform: string, config: TokenConfig): Record<string, string | undefined> {
  const env = { ...process.env } as Record<string, string | undefined>;
  const kapUrl = process.env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627';
  const kapToken = process.env.KIMI_CODE_TOKEN ?? '';
  const workDir = process.env.KIMI_WORK_DIR ?? process.cwd();

  // Common kap-server settings
  env.KIMI_SERVER_URL = kapUrl;
  env.KIMI_CODE_TOKEN = kapToken;
  env.KIMI_WORK_DIR = workDir;

  switch (platform) {
    case 'telegram': {
      const cfg = config.telegram;
      env.KIMI_TELEGRAM_BOT_TOKEN = getToken('KIMI_TELEGRAM_BOT_TOKEN', cfg?.token);
      if (cfg?.allowedUsers?.length) env.KIMI_TELEGRAM_ALLOWED_USERS = cfg.allowedUsers.join(',');
      if (cfg?.allowAll) env.KIMI_TELEGRAM_ALLOW_ALL_USERS = 'true';
      break;
    }
    case 'discord': {
      const cfg = config.discord;
      env.KIMI_DISCORD_BOT_TOKEN = getToken('KIMI_DISCORD_BOT_TOKEN', cfg?.token);
      break;
    }
    case 'slack': {
      const cfg = config.slack;
      env.KIMI_SLACK_BOT_TOKEN = getToken('KIMI_SLACK_BOT_TOKEN', cfg?.botToken);
      env.KIMI_SLACK_APP_TOKEN = getToken('KIMI_SLACK_APP_TOKEN', cfg?.appToken);
      env.KIMI_SLACK_SIGNING_SECRET = getToken('KIMI_SLACK_SIGNING_SECRET', cfg?.signingSecret);
      break;
    }
    case 'email': {
      const cfg = config.email;
      env.KIMI_EMAIL_ADDRESS = getToken('KIMI_EMAIL_ADDRESS', cfg?.address);
      env.KIMI_EMAIL_PASSWORD = getToken('KIMI_EMAIL_PASSWORD', cfg?.password);
      env.KIMI_EMAIL_IMAP_HOST = getToken('KIMI_EMAIL_IMAP_HOST', cfg?.imapHost);
      env.KIMI_EMAIL_SMTP_HOST = getToken('KIMI_EMAIL_SMTP_HOST', cfg?.smtpHost);
      break;
    }
    case 'voice': {
      const cfg = config.voice;
      env.KIMI_VOICE_OPENAI_KEY = getToken('KIMI_VOICE_OPENAI_KEY', cfg?.openaiKey);
      env.OPENAI_API_KEY = getToken('OPENAI_API_KEY', cfg?.openaiKey);
      break;
    }
  }
  return env;
}

type AdapterFactory = (env: Record<string, string | undefined>) => BasePlatformAdapter | null;

const FACTORIES: Array<{ platform: string; flag: string; create: AdapterFactory }> = [
  { platform: 'telegram', flag: 'KIMI_PLATFORM_TELEGRAM', create: (e) => createTelegramAdapter(e) },
  { platform: 'discord', flag: 'KIMI_PLATFORM_DISCORD', create: (e) => createDiscordAdapter(e) },
  { platform: 'slack', flag: 'KIMI_PLATFORM_SLACK', create: (e) => createSlackAdapter(e) },
  { platform: 'email', flag: 'KIMI_PLATFORM_EMAIL', create: (e) => createEmailAdapter(e) },
  { platform: 'voice', flag: 'KIMI_PLATFORM_VOICE', create: (e) => createVoiceAdapter(e) },
];

// ── Runner state ────────────────────────────────────────────────────────────
const adapters: BasePlatformAdapter[] = [];
const adapterStatuses = new Map<string, { status: string; error?: string }>();
const enableAll = process.env.KIMI_PLATFORM_ALL === 'true';
const startTime = Date.now();

function isPlatformEnabled(flag: string): boolean {
  return enableAll || process.env[flag] === 'true';
}

async function tryStartAdapters() {
  for (const { platform, flag, create } of FACTORIES) {
    // Skip if already running or not enabled
    if (adapters.some(a => a.platformName === platform)) continue;
    if (!isPlatformEnabled(flag)) {
      adapterStatuses.set(platform, { status: 'disabled' });
      continue;
    }

    const env = buildAdapterEnv(platform, loadConfigFile());
    const adapter = create(env);
    if (!adapter) {
      adapterStatuses.set(platform, { status: 'no-token', error: 'Missing required env vars' });
      continue;
    }

    try {
      console.log(`[${platform}] Starting...`);
      adapterStatuses.set(platform, { status: 'starting' });
      await adapter.start();
      adapters.push(adapter);
      adapterStatuses.set(platform, { status: 'connected' });
      console.log(`[${platform}] ✅ Connected`);
    } catch (err) {
      adapterStatuses.set(platform, { status: 'error', error: String(err) });
      console.error(`[${platform}] ❌ Failed: ${err}`);
    }
  }
}

function getStatusSummary(): Record<string, unknown> {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  return {
    status: adapters.length > 0 ? 'running' : 'waiting-for-tokens',
    uptime,
    connected: adapters.map(a => a.platformName),
    platforms: Object.fromEntries(
      FACTORIES.map(f => [f.platform, adapterStatuses.get(f.platform) ?? { status: 'pending' }])
    ),
  };
}

// ── Health check HTTP server ────────────────────────────────────────────────
function startHealthServer() {
  const port = Number(process.env.PORT ?? process.env.HEALTH_PORT ?? 8080);
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/health' || req.url === '/') {
      const body = JSON.stringify(getStatusSummary(), null, 2);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(port, () => {
    console.log(`[kimi-platforms] Health check: http://localhost:${port}/health`);
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
console.log(`[kimi-platforms] Starting — platforms: ${
  FACTORIES.filter(f => isPlatformEnabled(f.flag)).map(f => f.platform).join(', ') || 'none'
}`);

startHealthServer();

// Initial attempt
await tryStartAdapters();

if (adapters.length === 0) {
  console.log('[kimi-platforms] No adapters connected. Waiting for tokens...');
  console.log('[kimi-platforms] Add tokens via env vars or platform-tokens.json');
  console.log('[kimi-platforms] Retrying every 30s — send /start to your Telegram bot after adding token');

  // Retry loop — stay alive and re-check every 30s
  setInterval(async () => {
    const prev = adapters.length;
    await tryStartAdapters();
    if (adapters.length > prev) {
      console.log(`[kimi-platforms] ${adapters.length} adapter(s) now connected`);
    }
  }, 30_000);
} else {
  console.log(`[kimi-platforms] ${adapters.length} adapter(s) connected: ${adapters.map(a => a.platformName).join(', ')}`);
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n[kimi-platforms] ${signal} — shutting down ${adapters.length} adapter(s)...`);
  await Promise.all(adapters.map(a => a.stop().catch(console.error)));
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
