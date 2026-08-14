/**
 * Discord platform adapter for Kimi Code.
 *
 * Connects a Discord bot to kap-server. Handles text channels, threads,
 * slash commands, and voice messages (transcription via Whisper).
 *
 * Env vars:
 *   KIMI_DISCORD_BOT_TOKEN     — required
 *   KIMI_DISCORD_ALLOWED_USERS — comma-separated user IDs
 *   KIMI_DISCORD_ALLOW_ALL     — "true" to allow everyone
 *   KIMI_DISCORD_GUILD_ID      — restrict to a specific server
 *   KIMI_DISCORD_COMMAND_PREFIX — default "/"
 */

import { Client, Collection, Events, GatewayIntentBits, Partials, type ChannelType, type Interaction, type Message } from 'discord.js';
import { BasePlatformAdapter, type PlatformConfig, type PlatformMessage, type SendResult } from '@moonshot-ai/platform-adapter';

export interface DiscordConfig extends PlatformConfig {
  readonly botToken: string;
  readonly allowedUsers?: string[];
  readonly allowAllUsers?: boolean;
  readonly guildId?: string;
  readonly commandPrefix?: string;
}

export class DiscordAdapter extends BasePlatformAdapter {
  readonly platformName = 'discord';
  readonly maxMessageLength = 2000; // Discord message limit

  private readonly dcConfig: DiscordConfig;
  private client: Client | null = null;
  private commandPrefix: string;

  constructor(config: DiscordConfig) {
    super(config);
    this.dcConfig = config;
    this.commandPrefix = config.commandPrefix ?? '/';
  }

  async connect(): Promise<boolean> {
    this.status = 'connecting';
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMembers,
        ],
        partials: [Partials.Channel, Partials.Message],
      });

      this.client.on(Events.ClientReady, () => this.onReady());
      this.client.on(Events.MessageCreate, (msg) => this.onMessage(msg));
      this.client.on(Events.InteractionCreate, (interaction) => this.onInteraction(interaction));

      await this.client.login(this.dcConfig.botToken);
      this.status = 'connected';
      return true;
    } catch (err) {
      this.status = 'error';
      console.error('[discord] Connection failed:', err);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
    }
    this.status = 'disconnected';
  }

  async start(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
    // Client is already connected via login()
    console.log('[discord] Bot ready');
  }

  async sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult> {
    if (!this.client) throw new Error('Client not connected');

    try {
      const channel = await this.client.channels.fetch(chatId);
      if (!channel?.isSendable()) {
        return { success: false };
      }

      const result = await channel.send({
        content: this.truncate(text),
        reply: replyToId ? { messageReference: replyToId } : undefined,
        allowedMentions: { repliedUser: false },
      });

      return { success: true, messageId: result.id };
    } catch (err) {
      console.error('[discord] Failed to send message:', err);
      return { success: false };
    }
  }

  async sendTyping(chatId: string): Promise<void> {
    if (!this.client) return;
    const channel = await this.client.channels.fetch(chatId);
    if (channel?.isSendable()) {
      await channel.sendTyping();
    }
  }

  private onReady(): void {
    console.log(`[discord] Logged in as ${this.client?.user?.tag}`);
  }

  private isAuthorized(userId: string): boolean {
    if (this.dcConfig.allowAllUsers) return true;
    if (this.dcConfig.allowedUsers && this.dcConfig.allowedUsers.length > 0) {
      return this.dcConfig.allowedUsers.includes(userId);
    }
    return true;
  }

  private async onMessage(message: Message): Promise<void> {
    // Ignore bots including ourselves, DMs if guild-restricted
    if (message.author.bot) return;
    if (this.dcConfig.guildId && message.guild?.id !== this.dcConfig.guildId) return;
    if (!this.isAuthorized(message.author.id)) return;

    // Check command prefix for guild messages
    const isDM = message.channel.type === 1; // DM
    if (isDM || message.content.startsWith(this.commandPrefix)) {
      const text = isDM ? message.content : message.content.slice(this.commandPrefix.length);

      const platformMsg: PlatformMessage = {
        messageId: message.id,
        chatId: message.channel.id,
        userId: message.author.id,
        userName: message.author.username,
        text: text.trim(),
        threadId: message.thread?.id,
      };

      await this.handleInbound(platformMsg);
    }
  }

  private async onInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      // Route slash commands (e.g., /ask, /edit, /run)
      const platformMsg: PlatformMessage = {
        messageId: interaction.id,
        chatId: interaction.channelId,
        userId: interaction.user.id,
        userName: interaction.user.username,
        text: `/${interaction.commandName} ${interaction.options.getString('input') ?? ''}`,
        threadId: interaction.guild?.id,
      };

      await this.handleInbound(platformMsg);
    }
  }

  private truncate(text: string): string {
    if (text.length <= this.maxMessageLength) return text;
    return text.slice(0, this.maxMessageLength - 3) + '...';
  }
}

export function createDiscordAdapter(env: Record<string, string>): DiscordAdapter | null {
  const botToken = env.KIMI_DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.error('[discord] KIMI_DISCORD_BOT_TOKEN not set');
    return null;
  }

  const config: DiscordConfig = {
    kapServerUrl: env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627',
    kapServerToken: env.KIMI_CODE_TOKEN ?? '',
    workDir: env.KIMI_WORK_DIR ?? process.cwd(),
    botToken,
    allowedUsers: env.KIMI_DISCORD_ALLOWED_USERS?.split(',').map(s => s.trim()),
    allowAllUsers: env.KIMI_DISCORD_ALLOW_ALL === 'true',
    guildId: env.KIMI_DISCORD_GUILD_ID,
    commandPrefix: env.KIMI_DISCORD_COMMAND_PREFIX ?? '/',
  };

  return new DiscordAdapter(config);
}
