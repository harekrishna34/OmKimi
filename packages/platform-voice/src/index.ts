/**
 * Voice mode for Kimi Code.
 *
 * - Speech-to-Text via OpenAI Whisper API
 * - Text-to-Speech via OpenAI TTS (or Edge TTS fallback)
 * - Push-to-talk with VAD (voice activity detection)
 *
 * Env vars:
 *   KIMI_VOICE_OPENAI_KEY    — required (or set OPENAI_API_KEY)
 *   KIMI_VOICE_MODEL         — stt model (default: whisper-1)
 *   KIMI_VOICE_TTS_MODEL     — tts model (default: tts-1)
 *   KIMI_VOICE_TTS_VOICE     — voice name (default: alloy)
 *   KIMI_VOICE_TTS_SPEED     — 0.25-4.0 (default 1.0)
 *   KIMI_VOICE_ENABLE_EDGE   — "true" to use Edge TTS instead of OpenAI
 */

import OpenAI from 'openai';
import { BasePlatformAdapter, type PlatformConfig, type PlatformMessage, type SendResult } from '@moonshot-ai/platform-adapter';
import { createReadStream } from 'node:fs';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export interface VoiceConfig extends PlatformConfig {
  readonly openaiKey: string;
  readonly sttModel?: string;
  readonly ttsModel?: string;
  readonly ttsVoice?: string;
  readonly ttsSpeed?: number;
  readonly useEdgeTTS?: boolean;
}

export class VoiceAdapter extends BasePlatformAdapter {
  readonly platformName = 'voice';
  readonly maxMessageLength = 16384;

  private readonly voiceConfig: VoiceConfig;
  private openai: OpenAI | null = null;
  private voiceCacheDir: string;

  constructor(config: VoiceConfig) {
    super(config);
    this.voiceConfig = config;
    this.voiceCacheDir = join(tmpdir(), 'kimi-voice-cache');
  }

  async connect(): Promise<boolean> {
    this.status = 'connecting';
    try {
      this.openai = new OpenAI({ apiKey: this.voiceConfig.openaiKey });
      await mkdir(this.voiceCacheDir, { recursive: true });
      this.status = 'connected';
      console.log('[voice] OpenAI client initialized');
      return true;
    } catch (err) {
      this.status = 'error';
      console.error('[voice] Connection failed:', err);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.openai = null;
    await rm(this.voiceCacheDir, { recursive: true, force: true });
    this.status = 'disconnected';
  }

  async start(): Promise<void> {
    if (!this.openai) {
      await this.connect();
    }
    console.log('[voice] Voice mode ready. Use speak() or transcribe().');
  }

  /**
   * Transcribe audio file to text using Whisper.
   * @param audioPath - Path to audio file (wav, mp3, ogg, etc.)
   */
  async transcribe(audioPath: string): Promise<string> {
    if (!this.openai) {
      throw new Error('Voice adapter not connected');
    }

    const file = createReadStream(audioPath);
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: this.voiceConfig.sttModel ?? 'whisper-1',
      response_format: 'text',
    });

    return transcription as unknown as string;
  }

  /**
   * Convert text to speech audio.
   * @returns Path to the generated audio file (mp3)
   */
  async speak(text: string, outputPath?: string): Promise<string> {
    if (!this.openai) {
      throw new Error('Voice adapter not connected');
    }

    const output = outputPath ?? join(this.voiceCacheDir, `tts-${Date.now()}.mp3`);

    if (this.voiceConfig.useEdgeTTS) {
      // Edge TTS fallback would go here
      console.warn('[voice] Edge TTS not implemented, falling back to OpenAI TTS');
    }

    const stream = await this.openai.audio.speech.create({
      model: this.voiceConfig.ttsModel ?? 'tts-1',
      voice: this.voiceConfig.ttsVoice ?? 'alloy',
      input: text,
      speed: this.voiceConfig.ttsSpeed ?? 1.0,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await stream.arrayBuffer());
    await writeFile(output, buffer);
    return output;
  }

  /**
   * Full voice loop: transcribe input → send to kap-server → get response → speak response.
   * @param audioPath - Path to input audio
   * @param chatId - Chat identifier for the kap-server session
   */
  async processVoiceMessage(audioPath: string, chatId: string): Promise<string> {
    if (!this.openai) {
      throw new Error('Voice adapter not connected');
    }

    // Step 1: Transcribe the audio
    console.log('[voice] Transcribing...');
    const text = await this.transcribe(audioPath);
    console.log('[voice] Transcribed:', text);

    // Step 2: Send to kap-server
    const sessionId = await this.getOrCreateSession(chatId);
    const response = await this.sendPrompt(sessionId, text);
    console.log('[voice] Agent response:', response);

    // Step 3: Convert response to speech
    const audioOutput = await this.speak(response);
    console.log('[voice] TTS output saved to:', audioOutput);

    return audioOutput;
  }

  /**
   * Check if the voice input sounds like the end/stop phrase.
   */
  isVoiceStopPhrase(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return ['stop', 'exit', 'quit', 'enough', 'cancel'].includes(lower);
  }

  /**
   * Detect hallucinations in Whisper transcription.
   */
  isWhisperHallucination(text: string): boolean {
    // Common Whisper hallucinations
    const hallucinationPatterns = [
      /thank you for watching/i,
      /subscribe for more/i,
      /thanks for watching/i,
    ];
    return hallucinationPatterns.some(p => p.test(text));
  }

  async sendText(chatId: string, text: string, replyToId?: string): Promise<SendResult> {
    // Voice adapter doesn't send text — returns the path as messageId
    return { success: true, messageId: replyToId ?? text.slice(0, 50) };
  }

  // Override handleInbound to process voice messages through kap-server
  protected async handleVoiceMessage(message: PlatformMessage, audioPath: string): Promise<void> {
    try {
      const audioOutput = await this.processVoiceMessage(audioPath, message.chatId);
      // Caller is responsible for playing the audio file
      console.log('[voice] Response audio ready:', audioOutput);
    } catch (err) {
      console.error('[voice] Error processing voice:', err);
    }
  }
}

export function createVoiceAdapter(env: Record<string, string>): VoiceAdapter | null {
  const apiKey = env.KIMI_VOICE_OPENAI_KEY ?? env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[voice] KIMI_VOICE_OPENAI_KEY (or OPENAI_API_KEY) not set');
    return null;
  }

  const config: VoiceConfig = {
    kapServerUrl: env.KIMI_SERVER_URL ?? 'http://127.0.0.1:58627',
    kapServerToken: env.KIMI_CODE_TOKEN ?? '',
    workDir: env.KIMI_WORK_DIR ?? process.cwd(),
    openaiKey: apiKey,
    sttModel: env.KIMI_VOICE_MODEL,
    ttsModel: env.KIMI_VOICE_TTS_MODEL,
    ttsVoice: env.KIMI_VOICE_TTS_VOICE,
    ttsSpeed: env.KIMI_VOICE_TTS_SPEED ? parseFloat(env.KIMI_VOICE_TTS_SPEED) : undefined,
    useEdgeTTS: env.KIMI_VOICE_ENABLE_EDGE === 'true',
  };

  return new VoiceAdapter(config);
}
