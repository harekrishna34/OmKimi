/**
 * `user-modeling` domain — `UserModelingService`: user preference tracking.
 *
 * Tracks user patterns and preferences across sessions to personalize
 * the agent's behavior. Generates system prompt blocks for context injection.
 *
 * Inspired by Hermes Agent's Honcho dialectic user modeling.
 * Gated behind the `user_modeling` experimental flag.
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import { createDecorator, type ServiceIdentifier } from '#/_base/di/instantiation';
import { Service } from '#/_base/di/service';

import { extractAllPreferences } from './preference-extractor.js';
import type { InteractionEvent } from './types.js';
import { PreferenceStore } from './preference-store.js';
import type { PreferenceCategory, UserPreference, UserPreferenceInput } from './types.js';
import { DEFAULT_USER_MODELING_CONFIG, type UserModelingConfig } from './types.js';

export interface IUserModelingService {
  readonly _serviceBrand: undefined;

  /**
   * Track an interaction and extract preferences.
   */
  trackInteraction(events: readonly InteractionEvent[]): Promise<void>;

  /**
   * Manually set a user preference.
   */
  setPreference(input: UserPreferenceInput): Promise<UserPreference>;

  /**
   * Get a specific user preference.
   */
  getPreference(key: string): Promise<UserPreference | undefined>;

  /**
   * List all user preferences.
   */
  listPreferences(category?: PreferenceCategory): Promise<UserPreference[]>;

  /**
   * Generate a user context block for system prompt injection.
   */
  getSystemPromptBlock(): Promise<string>;

  /**
   * Get the configuration.
   */
  getConfig(): UserModelingConfig;
}

export const IUserModelingService: ServiceIdentifier<IUserModelingService> =
  createDecorator<IUserModelingService>('userModelingService');

export class UserModelingService extends Service implements IUserModelingService {
  declare readonly _serviceBrand: undefined;

  private readonly userModelingConfig: UserModelingConfig;
  private readonly store: PreferenceStore;
  private initialized = false;

  constructor(config: Partial<UserModelingConfig> = {}) {
    super();
    this.userModelingConfig = { ...DEFAULT_USER_MODELING_CONFIG, ...config };

    const storePath = path.join(
      os.homedir(),
      '.kimi-code',
      'user-preferences.json',
    );

    this.store = new PreferenceStore({
      storePath,
      maxPreferences: this.userModelingConfig.maxPreferences,
      decayRate: this.userModelingConfig.decayRate,
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    // Apply decay on startup
    await this.store.applyDecay();
    this.initialized = true;
  }

  async trackInteraction(events: readonly InteractionEvent[]): Promise<void> {
    if (!this.userModelingConfig.enabled) return;

    await this.ensureInitialized();

    // Extract preferences from the interaction events
    const result = extractAllPreferences(events);

    // Store extracted preferences
    for (const pref of result.preferences) {
      await this.store.setPreference(pref);
    }
  }

  async setPreference(input: UserPreferenceInput): Promise<UserPreference> {
    await this.ensureInitialized();
    return this.store.setPreference(input);
  }

  async getPreference(key: string): Promise<UserPreference | undefined> {
    await this.ensureInitialized();
    return this.store.getPreference(key);
  }

  async listPreferences(category?: PreferenceCategory): Promise<UserPreference[]> {
    await this.ensureInitialized();
    return this.store.listPreferences(category);
  }

  async getSystemPromptBlock(): Promise<string> {
    await this.ensureInitialized();

    const preferences = await this.store.listPreferences();
    if (preferences.length === 0) return '';

    // Group by category
    const grouped = new Map<PreferenceCategory, UserPreference[]>();
    for (const pref of preferences) {
      const group = grouped.get(pref.category) ?? [];
      group.push(pref);
      grouped.set(pref.category, group);
    }

    const lines: string[] = ['## User Profile', ''];

    const categoryLabels: Record<PreferenceCategory, string> = {
      coding_style: 'Coding Style',
      tool_preferences: 'Tool Preferences',
      communication_style: 'Communication Style',
      project_patterns: 'Project Patterns',
      error_patterns: 'Error Patterns',
      general: 'General',
    };

    for (const [category, prefs] of grouped) {
      lines.push(`### ${categoryLabels[category]}`);
      for (const pref of prefs) {
        const confidencePercent = (pref.confidence * 100).toFixed(0);
        lines.push(`- **${pref.key}**: ${pref.value} (${confidencePercent}% confidence)`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  getConfig(): UserModelingConfig {
    return { ...this.userModelingConfig };
  }
}
