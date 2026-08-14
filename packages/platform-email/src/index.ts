/**
 * Email platform adapter for Kimi Code.
 *
 * Polls IMAP for new emails, routes the body to kap-server,
 * and sends the agent response back as a reply via SMTP.
 *
 * Env vars:
 *   KIMI_EMAIL_ADDRESS     — required (IMAP/SMTP username)
 *   KIMI_EMAIL_PASSWORD    — required
 *   KIMI_EMAIL_IMAP_HOST   — required (e.g. imap.gmail.com)
 *   KIMI_EMAIL_IMAP_PORT   — default 993
 *   KIMI_EMAIL_SMTP_HOST   — required (e.g. smtp.gmail.com)
 *   KIMI_EMAIL_SMTP_PORT   — default 587
 *   KIMI_EMAIL_POLL_INTERVAL — seconds (default 30)
 *   KIMI_EMAIL_ALLOWED_SENDERS — comma-separated emails (empty = all)
 *   KIMI_EMAIL_ALLOW_ALL   — "true" to allow everyone
 */

import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { BasePlatformAdapter, type PlatformConfig, type PlatformMessage, type SendResult } from '@moonshot-ai/platform-adapter';
import type { ParsedMail } from 'mailparser';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export interface EmailConfig extends PlatformConfig {
  readonly emailAddress: string;
  readonly emailPassword: string;
  readonly imapHost: string;
  readonly imapPort: number;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly pollInterval: number;
  readonly allowedSenders?: string[];
  readonly allowAllSenders: boolean;
  readonly storePath?: string;
}

export class EmailAdapter extends BasePlatformAdapter {
  readonly platformName = 'email';
  readonly maxMessageLength = 50000; // No hard limit for email, use chunking

  private readonly emailConfig: EmailConfig;
  private imapClient: ImapFlow | null = null;
  private smtpTransport: nodemailer.Transporter | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private seenMessageIds: Set<string> = new Set();

  constructor(config: EmailConfig) {
    super(config);
    this.emailConfig = config;
  }

  async connect(): Promise<boolean> {
    this.status = 'connecting';
    try {
      this.imapClient = new ImapFlow({
        host: this.emailConfig.imapHost,
        port: this.emailConfig.imapPort,
        secure: true,
        auth: {
          user: this.emailConfig.emailAddress,
          pass: this.emailConfig.emailPassword,
        },
      });
      await this.imapClient.connect();
      this.status = 'connected';

      this.smtpTransport = nodemailer.createTransport({
        host: this.emailConfig.smtpHost,
        port: this.emailConfig.smtpPort,
        secure: this.emailConfig.smtpPort === 465,
        auth: {
          user: this.emailConfig.emailAddress,
          pass: this.emailConfig.emailPassword,
        },
      });

      console.log('[email] Connected to IMAP and SMTP');
      return true;
    } catch (err) {
      this.status = 'error';
      console.error('[email] Connection failed:', err);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.imapClient) {
      await this.imapClient.logout();
      this.imapClient = null;
    }
    if (this.smtpTransport) {
      this.smtpTransport.close();
      this.smtpTransport = null;
    }
    this.status = 'disconnected';
  }

  async start(): Promise<void> {
    if (!this.imapClient) {
      await this.connect();
    }

    // Start polling for new emails
    this.pollTimer = setInterval(() => this.pollInbox(), this.emailConfig.pollInterval * 1000);
    // Run first poll immediately
    await this.pollInbox();
    console.log(`[email] Polling started (every ${this.emailConfig.pollInterval}s)`);
  }

  async sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult> {
    if (!this.smtpTransport) {
      return { success: false };
    }

    try {
      const info = await this.smtpTransport.sendMail({
        from: this.emailConfig.emailAddress,
        to: chatId, // chatId in email adapter = recipient email
        subject: replyToId ? `Re: ${replyToId}` : 'Kimi Code Response',
        text: this.truncate(text),
        inReplyTo: replyToId,
        references: replyToId,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[email] Failed to send email:', err);
      return { success: false };
    }
  }

  private async pollInbox(): Promise<void> {
    if (!this.imapClient) return;

    try {
      const lock = await this.imapClient.getMailboxLock('INBOX');

      // Search for unseen messages
      const messages = await this.imapClient.fetch(
        { seen: false },
        { envelope: true, source: true },
      );

      for await (const msg of messages) {
        const envelope = msg.envelope;
        if (!envelope) continue;

        const messageId = envelope.messageId ?? `${envelope.date?.getTime()}-${msg.seq}`;
        if (this.seenMessageIds.has(messageId)) continue;

        // Check sender authorization
        const senderEmail = envelope.from?.[0]?.address ?? '';
        if (!this.isSenderAllowed(senderEmail)) {
          console.log(`[email] Unauthorized sender: ${senderEmail}`);
          continue;
        }

        this.seenMessageIds.add(messageId);

        // Parse the email (msg.source is a Buffer)
        const source = msg.source;
        if (!source) continue;

        const parsed: ParsedMail = await simpleParser(source);

        // Handle any attachments
        const mediaUrls: NonNullable<PlatformMessage['media']> = [];
        if (parsed.attachments && parsed.attachments.length > 0) {
          for (const att of parsed.attachments) {
            const filePath = join(this.emailConfig.storePath ?? '', att.filename ?? `attachment-${Date.now()}`);
            try {
              await writeFile(filePath, att.content);
              mediaUrls.push({
                type: this.guessMediaType(att.contentType),
                url: filePath,
                mime: att.contentType,
              });
            } catch (err) {
              console.error('[email] Failed to save attachment:', err);
            }
          }
        }

        const platformMsg: PlatformMessage = {
          messageId: messageId,
          chatId: senderEmail,
          userId: senderEmail, // For email, email address serves as user ID
          text: parsed.text ?? parsed.subject ?? '',
          replyToId: envelope.inReplyTo,
          metadata: { subject: parsed.subject, attachments: parsed.attachments },
          ...(mediaUrls.length > 0 ? { media: mediaUrls } : {}),
        };

        // Mark as seen
        if (this.imapClient) {
          await this.imapClient.messageFlagsAdd(msg.uid, ['\\Seen']);
        }

        // Handle through the platform adapter
        void this.handleInbound(platformMsg);
      }

      // Release the lock
      lock.release();
    } catch (err) {
      console.error('[email] Polling error:', err);
    }
  }

  private isSenderAllowed(senderEmail: string): boolean {
    if (this.emailConfig.allowAllSenders) return true;
    if (this.emailConfig.allowedSenders && this.emailConfig.allowedSenders.length > 0) {
      return this.emailConfig.allowedSenders.includes(senderEmail);
    }
    return true;
  }

  private guessMediaType(contentType: string): 'image' | 'audio' | 'video' | 'document' {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    return 'document';
  }

  private truncate(text: string): string {
    if (text.length <= this.maxMessageLength) return text;
    return text.slice(0, this.maxMessageLength - 3) + '...';
  }
}

export function createEmailAdapter(env: Record<string, string>): EmailAdapter | null {
  const emailAddress = env.KIMI_EMAIL_ADDRESS;
  const emailPassword = env.KIMI_EMAIL_PASSWORD;
  const imapHost = env.KIMI_EMAIL_IMAP_HOST;
  const smtpHost = env.KIMI_EMAIL_SMTP_HOST;

  if (!emailAddress || !emailPassword || !imapHost || !smtpHost) {
    console.error('[email] Missing required env vars (KIMI_EMAIL_ADDRESS, KIMI_EMAIL_PASSWORD, KIMI_EMAIL_IMAP_HOST, KIMI_EMAIL_SMTP_HOST)');
    return null;
  }

  const config: EmailConfig = {
    kapServerUrl: env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627',
    kapServerToken: env.KIMI_CODE_TOKEN ?? '',
    workDir: env.KIMI_WORK_DIR ?? process.cwd(),
    emailAddress,
    emailPassword,
    imapHost,
    imapPort: parseInt(env.KIMI_EMAIL_IMAP_PORT ?? '993', 10),
    smtpHost,
    smtpPort: parseInt(env.KIMI_EMAIL_SMTP_PORT ?? '587', 10),
    pollInterval: parseInt(env.KIMI_EMAIL_POLL_INTERVAL ?? '30', 10),
    allowedSenders: env.KIMI_EMAIL_ALLOWED_SENDERS?.split(',').map(s => s.trim()),
    allowAllSenders: env.KIMI_EMAIL_ALLOW_ALL === 'true',
    storePath: env.KIMI_EMAIL_STORE_PATH ?? join(tmpdir(), 'kimi-email-attachments'),
  };

  return new EmailAdapter(config);
}
