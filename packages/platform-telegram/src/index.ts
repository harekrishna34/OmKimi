/**
 * Telegram platform adapter for Kimi Code.
 *
 * Connects a Telegram bot to kap-server. Inbound messages from Telegram are
 * routed to a kap-server session; agent responses are sent back to the chat.
 *
 * Env vars (mirror Hermes TELEGRAM_* pattern):
 *   KIMI_TELEGRAM_BOT_TOKEN  — required
 *   KIMI_TELEGRAM_ALLOWED_USERS — comma-separated user IDs (empty = all)
 *   KIMI_TELEGRAM_ALLOW_ALL_USERS — "true" to allow everyone
 *   KIMI_TELEGRAM_HOME_CHANNEL  — default channel for announcements
 *   KIMI_TELEGRAM_REPLY_TO_MODE — "all" | "mention_only" | "dm_only"
 */

import { Telegraf, type Context } from 'telegraf';

import { BasePlatformAdapter, type PlatformConfig, type PlatformMessage, type SendResult } from '@moonshot-ai/platform-adapter';

export interface TelegramConfig extends PlatformConfig {
  readonly botToken: string;
  readonly allowedUsers?: string[];
  readonly allowAllUsers?: boolean;
  readonly homeChannel?: string;
  readonly replyToMode?: 'all' | 'mention_only' | 'dm_only';
}

export class TelegramAdapter extends BasePlatformAdapter {
  readonly platformName = 'telegram';
  readonly maxMessageLength = 4096; // Telegram message limit in UTF-16 code units

  private readonly tgConfig: TelegramConfig;
  private bot: Telegraf | null = null;

  constructor(config: TelegramConfig) {
    super(config);
    this.tgConfig = config;
  }

  async connect(): Promise<boolean> {
    this.status = 'connecting';
    try {
      this.bot = new Telegraf(this.tgConfig.botToken);

      // Register handlers
      this.bot.start((ctx) => this.handleStart(ctx));
      this.bot.on('text', (ctx) => this.handleText(ctx));
      this.bot.on('photo', (ctx) => this.handleMedia(ctx, 'image'));
      this.bot.on('video', (ctx) => this.handleMedia(ctx, 'video'));
      this.bot.on('document', (ctx) => this.handleMedia(ctx, 'document'));
      this.bot.on('voice', (ctx) => this.handleMedia(ctx, 'audio'));
      this.bot.on('audio', (ctx) => this.handleMedia(ctx, 'audio'));

      this.status = 'connected';
      console.log('[telegram] Bot connected');
      return true;
    } catch (err) {
      this.status = 'error';
      console.error('[telegram] Connection failed:', err);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.bot = null;
    }
    this.status = 'disconnected';
  }

  async start(): Promise<void> {
    if (!this.bot) {
      await this.connect();
    }
    // Launch with long-polling
    await this.bot!.launch();
    console.log('[telegram] Polling started');
  }

  async sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult> {
    if (!this.bot) throw new Error('Bot not connected');
    const replyToMessageId = replyToId ? parseInt(replyToId, 10) : undefined;

    try {
      const result = await this.bot.telegram.sendMessage(chatId, text, {
        reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined,
        parse_mode: 'Markdown',
      });
      return { success: true, messageId: String(result.message_id) };
    } catch (err) {
      // Fallback without Markdown if escaping fails
      try {
        const result = await this.bot.telegram.sendMessage(chatId, text, {
          reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined,
        });
        return { success: true, messageId: String(result.message_id) };
      } catch (err2) {
        console.error('[telegram] Failed to send message:', err2);
        return { success: false };
      }
    }
  }

  async sendTyping(chatId: string): Promise<void> {
    if (!this.bot) return;
    await this.bot.telegram.sendChatAction(chatId, 'typing');
  }

  // -- Inbound handlers --

  private isAuthorized(userId: number): boolean {
    if (this.tgConfig.allowAllUsers) return true;
    if (this.tgConfig.allowedUsers && this.tgConfig.allowedUsers.length > 0) {
      return this.tgConfig.allowedUsers.includes(String(userId));
    }
    return true; // Default: allow all (configurable)
  }

  private handleStart(ctx: Context): void {
    const name = ctx.from?.first_name ?? 'there';
    ctx.reply(`Hello ${name}! I'm Kimi Code. Type /help to see available commands.`);
  }

  private async handleText(ctx: Context): Promise<void> {
    const message = ctx.message;
    const userId = message?.from?.id;
    const userName = message?.from?.first_name;
    const chatId = message?.chat?.id;
    if (!message || !chatId) return;
    const text = 'text' in message ? message.text : undefined;
    if (!text) return;

    // Check mention mode for groups
    if (message.chat.type !== 'private' && this.tgConfig.replyToMode === 'mention_only') {
      const bot = this.bot?.botInfo;
      if (!bot) return;
      const mention = text.includes(`@${bot.username}`) || text.includes(bot.id.toString());
      if (!mention) return; // Ignore messages that don't mention the bot
    }

    if (!this.isAuthorized(userId!)) {
      await this.sendText(String(chatId), 'You are not authorized to use this bot.');
      return;
    }

    const platformMsg: PlatformMessage = {
      messageId: String(message.message_id),
      chatId: String(chatId),
      userId: String(userId),
      userName,
      text,
    };

    await this.handleInbound(platformMsg);
  }

  private async handleMedia(
    ctx: Context,
    mediaType: 'image' | 'video' | 'document' | 'audio',
  ): Promise<void> {
    const message = ctx.message;
    const userId = message?.from?.id;
    const chatId = message?.chat?.id;
    const userName = message?.from?.first_name;
    if (!message || !chatId) return;

    // Determine caption/text from media
    let text = '';
    if ('caption' in message && message.caption) {
      text = message.caption;
    } else if ('text' in message && message.text) {
      text = message.text;
    }

    // Download media file
    const mediaUrls: PlatformMessage['media'] = [];
    try {
      const bot = this.bot;
      if (!bot) return;

      let fileId: string | undefined;
      let mimeType = 'application/octet-stream';

      if (mediaType === 'image' && 'photo' in message && message.photo) {
        fileId = message.photo[message.photo.length - 1]?.file_id;
        mimeType = 'image/jpeg';
      } else if (mediaType === 'video' && 'video' in message && message.video) {
        fileId = message.video.file_id;
        mimeType = message.video.mime_type ?? 'video/mp4';
      } else if (mediaType === 'document' && 'document' in message && message.document) {
        fileId = message.document.file_id;
        mimeType = message.document.mime_type ?? 'application/octet-stream';
      } else if ((mediaType === 'audio') && 'voice' in message && message.voice) {
        fileId = message.voice.file_id;
        mimeType = 'audio/ogg';
      }

      if (fileId) {
        const link = await bot.telegram.getFileLink(fileId);
        mediaUrls.push({ type: mediaType, url: link.href, mime: mimeType });
      }
    } catch (err) {
      console.error('[telegram] Failed to download media:', err);
    }

    const platformMsg: PlatformMessage = {
      messageId: String(message.message_id),
      chatId: String(chatId),
      userId: String(userId ?? ''),
      userName,
      text,
      media: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    await this.handleInbound(platformMsg);
  }
}

export function createTelegramAdapter(env: Record<string, string>): TelegramAdapter | null {
  const botToken = env.KIMI_TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('[telegram] KIMI_TELEGRAM_BOT_TOKEN not set');
    return null;
  }

  const allowedUsersRaw = env.KIMI_TELEGRAM_ALLOWED_USERS;
  const allowedUsers = allowedUsersRaw ? allowedUsersRaw.split(',').map(s => s.trim()) : undefined;

  const config: TelegramConfig = {
    kapServerUrl: env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627',
    kapServerToken: env.KIMI_CODE_TOKEN ?? '',
    workDir: env.KIMI_WORK_DIR ?? process.cwd(),
    botToken,
    allowedUsers,
    allowAllUsers: env.KIMI_TELEGRAM_ALLOW_ALL_USERS === 'true',
    homeChannel: env.KIMI_TELEGRAM_HOME_CHANNEL,
    replyToMode: (env.KIMI_TELEGRAM_REPLY_TO_MODE as TelegramConfig['replyToMode']) ?? 'all',
  };

  return new TelegramAdapter(config);
}
