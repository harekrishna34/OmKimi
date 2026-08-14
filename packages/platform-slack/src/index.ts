/**
 * Slack platform adapter for Kimi Code.
 *
 * Uses Slack Bolt with Socket Mode. Handles app mentions and DMs.
 * Commands like /kimi, /kimi ask, /kimi edit, /kimi run.
 *
 * Env vars:
 *   KIMI_SLACK_APP_TOKEN     — required (xapp-*)
 *   KIMI_SLACK_BOT_TOKEN     — required (xoxb-*)
 *   KIMI_SLACK_SIGNING_SECRET — required
 *   KIMI_SLACK_ALLOWED_USERS — comma-separated user IDs
 *   KIMI_SLACK_ALLOW_ALL     — "true" to allow everyone
 */

import { App, LogLevel } from '@slack/bolt';
import { BasePlatformAdapter, type PlatformConfig, type PlatformMessage, type SendResult } from '@moonshot-ai/platform-adapter';

// Fix: import types from bolt directly
export interface SlackConfig extends PlatformConfig {
  readonly appToken: string;
  readonly botToken: string;
  readonly signingSecret: string;
  readonly allowedUsers?: string[];
  readonly allowAllUsers?: boolean;
}

export class SlackAdapter extends BasePlatformAdapter {
  readonly platformName = 'slack';
  readonly maxMessageLength = 40000; // Slack allows up to 40k chars

  private readonly slackConfig: SlackConfig;
  private app: App | null = null;

  constructor(config: SlackConfig) {
    super(config);
    this.slackConfig = config;
  }

  async connect(): Promise<boolean> {
    this.status = 'connecting';
    try {
      this.app = new App({
        token: this.slackConfig.botToken,
        appToken: this.slackConfig.appToken,
        signingSecret: this.slackConfig.signingSecret,
        socketMode: true,
        logLevel: LogLevel.INFO,
      });

      // Message handler (DMs and mentions)
      this.app.message(async ({ message, say }) => {
        await this.handleSlackMessage(message, say);
      });

      // Command handler
      this.app.command('/kimi', async ({ command, ack, respond }) => {
        await ack();
        await this.handleSlackCommand(command.text, respond);
      });

      // Shortcut for app mentions
      this.app.event('app_mention', async ({ event, say }) => {
        await this.handleAppMention(event, say);
      });

      await this.app.start();
      this.status = 'connected';
      console.log('[slack] App connected via Socket Mode');
      return true;
    } catch (err) {
      this.status = 'error';
      console.error('[slack] Connection failed:', err);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      // @slack/bolt doesn't expose a clean stop in older versions
      await this.app.stop();
      this.app = null;
    }
    this.status = 'disconnected';
  }

  async start(): Promise<void> {
    if (!this.app) {
      await this.connect();
    }
    console.log('[slack] Listening for messages');
  }

  async sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult> {
    if (!this.app) throw new Error('App not connected');

    try {
      const result = await this.app.client.chat.postMessage({
        channel: chatId,
        text: this.truncate(text),
        thread_ts: replyToId,
        mrkdwn: true,
        unfurl_links: false,
      });
      return { success: true, messageId: result.ts };
    } catch (err) {
      console.error('[slack] Failed to send message:', err);
      return { success: false };
    }
  }

  async sendTyping(chatId: string): Promise<void> {
    if (!this.app) return;
    try {
      await this.app.client.chat.postMessage({
        channel: chatId,
        text: '_typing..._',
        // Slack doesn't have native typing indicators via API
      });
    } catch {
      // Silent fail
    }
  }

  private isAuthorized(userId: string): boolean {
    if (this.slackConfig.allowAllUsers) return true;
    if (this.slackConfig.allowedUsers && this.slackConfig.allowedUsers.length > 0) {
      return this.slackConfig.allowedUsers.includes(userId);
    }
    return true;
  }

  private async handleSlackMessage(message: any, say: any): Promise<void> {
    // Only handle DMs and app mentions
    if (message.channel_type === 'im' || message.subtype === 'app_mention') {
      const userId = message.user;
      if (!this.isAuthorized(userId)) return;

      const platformMsg: PlatformMessage = {
        messageId: String(message.ts),
        chatId: message.channel,
        userId,
        text: message.text ?? '',
      };

      await this.handleInbound(platformMsg);
    }
  }

  private async handleSlackCommand(text: string, respond: any): Promise<void> {
    // text contains the command args
    const platformMsg: PlatformMessage = {
      messageId: `cmd-${Date.now()}`,
      chatId: '', // Will be filled from context
      userId: '', // Will be filled from context
      text: `/kimi ${text}`,
    };

    // For commands, we need the channel from the command context
    // This is handled inline rather than through the generic handler
    await this.handleInbound({
      ...platformMsg,
      chatId: 'command', // Will be resolved from command context
    });
  }

  private async handleAppMention(event: any, say: any): Promise<void> {
    if (!this.isAuthorized(event.user)) return;

    // Strip the mention from text
    const text = event.text.replace(/<@\w+>/, '').trim();

    const platformMsg: PlatformMessage = {
      messageId: String(event.ts),
      chatId: event.channel,
      userId: event.user,
      text: text || '/',
    };

    await this.handleInbound(platformMsg);
  }

  private truncate(text: string): string {
    if (text.length <= this.maxMessageLength) return text;
    return text.slice(0, this.maxMessageLength - 3) + '...';
  }
}

export function createSlackAdapter(env: Record<string, string>): SlackAdapter | null {
  const appToken = env.KIMI_SLACK_APP_TOKEN;
  const botToken = env.KIMI_SLACK_BOT_TOKEN;
  const signingSecret = env.KIMI_SLACK_SIGNING_SECRET;

  if (!appToken || !botToken || !signingSecret) {
    console.error('[slack] KIMI_SLACK_APP_TOKEN, KIMI_SLACK_BOT_TOKEN, and KIMI_SLACK_SIGNING_SECRET required');
    return null;
  }

  const config: SlackConfig = {
    kapServerUrl: env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627',
    kapServerToken: env.KIMI_CODE_TOKEN ?? '',
    workDir: env.KIMI_WORK_DIR ?? process.cwd(),
    appToken,
    botToken,
    signingSecret,
    allowedUsers: env.KIMI_SLACK_ALLOWED_USERS?.split(',').map(s => s.trim()),
    allowAllUsers: env.KIMI_SLACK_ALLOW_ALL === 'true',
  };

  return new SlackAdapter(config);
}
