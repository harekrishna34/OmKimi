/**
 * Base platform adapter — the contract every messaging platform (Telegram,
 * Discord, Slack, Email, etc.) implements to connect to kap-server.
 *
 * Adapted from Hermes `BasePlatformAdapter` pattern but running as a
 * separate worker that talks to kap-server over HTTP + WebSocket.
 */

import WebSocket from 'ws';

export interface PlatformConfig {
  /** kap-server base URL */
  readonly kapServerUrl: string;
  /** Bearer token for kap-server auth (KIMI_CODE_TOKEN) */
  readonly kapServerToken: string;
  /** Work directory for sessions */
  readonly workDir: string;
  /** Platform-specific extra config */
  readonly extra?: Record<string, unknown>;
}

export type PlatformStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface PlatformMessage {
  /** Unique message ID from the platform */
  readonly messageId: string;
  /** Chat/conversation ID */
  readonly chatId: string;
  /** User who sent the message */
  readonly userId: string;
  /** User display name (optional) */
  readonly userName?: string;
  /** Message text content */
  readonly text: string;
  /** Media attachments (already downloaded to local paths) */
  readonly media?: Array<{ type: 'image' | 'audio' | 'video' | 'document'; url: string; mime: string }>;
  /** Reply-to message ID if this is a reply */
  readonly replyToId?: string;
  /** Thread ID (for forums/threads) */
  readonly threadId?: string;
  /** Raw metadata from platform */
  readonly metadata?: Record<string, unknown>;
}

export interface SendResult {
  readonly success: boolean;
  readonly messageId?: string;
}

export interface SessionRecord {
  /** kap-server session ID */
  readonly sessionId: string;
  /** Platform chat ID this session maps to */
  readonly chatId: string;
  /** Thread ID (if applicable) */
  readonly threadId?: string;
  /** User ID for single-DM sessions */
  readonly userId?: string;
}

/**
 * Base platform adapter — mirrors Hermes' BasePlatformAdapter contract.
 * Each platform (Telegram, Discord, etc.) extends this and implements
 * the transport-specific connect/disconnect/send/inbound handling.
 */
export abstract class BasePlatformAdapter {
  protected readonly config: PlatformConfig;
  protected status: PlatformStatus = 'disconnected';

  // Session cache: chatId -> sessionId
  protected sessions: Map<string, SessionRecord> = new Map();

  constructor(config: PlatformConfig) {
    this.config = config;
  }

  /** @returns current connection status */
  getStatus(): PlatformStatus {
    return this.status;
  }

  /** Platform name for logging/identification */
  abstract readonly platformName: string;

  /** Max message length before chunking (Telegram=4096, Slack=40k, etc.) */
  abstract readonly maxMessageLength: number;

  /** Connect to the platform (long-polling or webhook) */
  abstract connect(): Promise<boolean>;

  /** Disconnect from the platform */
  abstract disconnect(): Promise<void>;

  /** Send a text message to a chat */
  abstract sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult>;

  /** Send a typing indicator */
  sendTyping?(chatId: string): Promise<void>;

  /** Start the adapter loop — platform handles inbound messages */
  abstract start(): Promise<void>;

  /** Stop the adapter loop */
  async stop(): Promise<void> {
    await this.disconnect();
  }

  // -- kap-server bridge methods --

  /** Create a new kap-server session for this chat */
  protected async createSession(chatId: string, userId?: string): Promise<string> {
    const res = await fetch(`${this.config.kapServerUrl}/api/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.kapServerToken}` },
      body: JSON.stringify({ metadata: { cwd: this.config.workDir, chatId, userId } }),
    });
    const envelope = await res.json() as { data?: { id: string }; msg?: string };
    if (!envelope.data?.id) throw new Error(`Failed to create session: ${envelope.msg ?? 'unknown'}`);

    const sessionId = envelope.data.id;
    this.sessions.set(chatId, { sessionId, chatId, userId });
    return sessionId;
  }

  /** Get or create a session for a chat */
  protected async getOrCreateSession(chatId: string, userId?: string): Promise<string> {
    const existing = this.sessions.get(chatId);
    if (existing) return existing.sessionId;
    return this.createSession(chatId, userId);
  }

  /** Send a prompt to kap-server and return the response text */
  protected async sendPrompt(sessionId: string, text: string): Promise<string> {
    // Submit the prompt
    await fetch(`${this.config.kapServerUrl}/api/v1/sessions/${sessionId}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.kapServerToken}` },
      body: JSON.stringify({ content: [{ type: 'text', text }] }),
    });

    // Poll for the response message
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(r => setTimeout(r, 500));
      const res = await fetch(`${this.config.kapServerUrl}/api/v1/sessions/${sessionId}/messages?role=assistant&page_size=1`, {
        headers: { Authorization: `Bearer ${this.config.kapServerToken}` },
      });
      const envelope = await res.json() as { data?: { items: Array<{ content: string }> } };
      const messages = envelope.data?.items;
      if (messages && messages.length > 0) {
        return messages[0]!.content;
      }
      attempts++;
    }
    throw new Error('Timeout waiting for kap-server response');
  }

  /** Subscribe to a session's events via WebSocket (for streaming) */
  protected subscribeToSessionEvents(sessionId: string, onEvent: (data: unknown) => void): WebSocket | null {
    const ws = new WebSocket(`${this.config.kapServerUrl.replace('http', 'ws')}/api/v1/ws`, {
      headers: { Authorization: `Bearer ${this.config.kapServerToken}` },
    });
    ws.on('message', (data) => {
      try {
        const raw = typeof data === 'string' ? data : Buffer.from(data as ArrayLike<number>).toString('utf8');
        const frame = JSON.parse(raw);
        if (frame.session_id === sessionId || frame.type === 'session_event') {
          onEvent(frame);
        }
      } catch {
        // Non-JSON frame, ignore
      }
    });
    return ws;
  }

  /** Handle an inbound message — create/reuse session, send prompt, reply */
  protected async handleInbound(message: PlatformMessage): Promise<void> {
    const sessionId = await this.getOrCreateSession(message.chatId, message.userId);

    if (this.sendTyping) await this.sendTyping(message.chatId);

    try {
      const response = await this.sendPrompt(sessionId, message.text);
      // Chunk if too long
      const chunks = this.chunkMessage(response);
      let replyTo: string | undefined = message.messageId;
      for (const chunk of chunks) {
        const result = await this.sendText(message.chatId, chunk, replyTo);
        replyTo = result.messageId;
      }
    } catch (err) {
      console.error(`[${this.platformName}] Error handling message: ${err}`);
      await this.sendText(message.chatId, 'Error: failed to process your message. Please try again.');
    }
  }

  /** Split a long message into chunks respecting maxMessageLength */
  protected chunkMessage(text: string): string[] {
    if (text.length <= this.maxMessageLength) return [text];
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + this.maxMessageLength));
      i += this.maxMessageLength;
    }
    return chunks;
  }
}

export { WebSocket };
