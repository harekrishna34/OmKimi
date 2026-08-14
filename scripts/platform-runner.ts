/**
 * Platform adapter launcher — starts all enabled platform adapters.
 * Run: npx tsx scripts/platform-runner.ts
 *
 * Each adapter connects to its respective platform (Telegram, Discord, Slack,
 * Email, Voice) and routes messages to kap-server.
 *
 * Adapters enabled via env vars:
 *   KIMI_PLATFORM_TELEGRAM=true
 *   KIMI_PLATFORM_DISCORD=true
 *   KIMI_PLATFORM_SLACK=true
 *   KIMI_PLATFORM_EMAIL=true
 *   KIMI_PLATFORM_VOICE=true
 *
 * Or KIMI_PLATFORM_ALL=true for all platforms.
 */

import { createTelegramAdapter } from '../packages/platform-telegram/src/index.js';
import { createDiscordAdapter } from '../packages/platform-discord/src/index.js';
import { createSlackAdapter } from '../packages/platform-slack/src/index.js';
import { createEmailAdapter } from '../packages/platform-email/src/index.js';
import { createVoiceAdapter } from '../packages/platform-voice/src/index.js';
import type { BasePlatformAdapter } from '../packages/platform-adapter/src/index.js';

const env = process.env;
const enableAll = env.KIMI_PLATFORM_ALL === 'true';
const adapters: BasePlatformAdapter[] = [];

if (enableAll || env.KIMI_PLATFORM_TELEGRAM === 'true') {
  const adapter = createTelegramAdapter(env);
  if (adapter) adapters.push(adapter);
}

if (enableAll || env.KIMI_PLATFORM_DISCORD === 'true') {
  const adapter = createDiscordAdapter(env);
  if (adapter) adapters.push(adapter);
}

if (enableAll || env.KIMI_PLATFORM_SLACK === 'true') {
  const adapter = createSlackAdapter(env);
  if (adapter) adapters.push(adapter);
}

if (enableAll || env.KIMI_PLATFORM_EMAIL === 'true') {
  const adapter = createEmailAdapter(env);
  if (adapter) adapters.push(adapter);
}

if (enableAll || env.KIMI_PLATFORM_VOICE === 'true') {
  const adapter = createVoiceAdapter(env);
  if (adapter) adapters.push(adapter);
}

if (adapters.length === 0) {
  console.log('[kimi-platforms] No platform adapters enabled. Set KIMI_PLATFORM_ALL=true or individual KIMI_PLATFORM_<NAME>=true');
  process.exit(0);
}

console.log(`[kimi-platforms] Starting ${adapters.length} adapter(s)...`);

const shutdown = async (signal: string) => {
  console.log(`\n[kimi-platforms] Received ${signal}, shutting down...`);
  await Promise.all(adapters.map(a => a.stop().catch(console.error)));
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

for (const adapter of adapters) {
  adapter.start().catch((err) => {
    console.error(`[${adapter.platformName}] Fatal error:`, err);
  });
}

console.log(`[kimi-platforms] ${adapters.map(a => a.platformName).join(', ')} ready.`);
