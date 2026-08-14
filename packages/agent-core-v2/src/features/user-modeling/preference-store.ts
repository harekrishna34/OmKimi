/**
 * `user-modeling` domain — persistent preference storage.
 *
 * Stores user preferences with confidence scoring and decay.
 * Uses a simple JSON file for persistence (can be upgraded to SQLite later).
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { PreferenceCategory, UserPreference, UserPreferenceInput } from './types.js';

export interface PreferenceStoreOptions {
  readonly storePath: string;
  readonly maxPreferences?: number;
  readonly decayRate?: number;
}

export class PreferenceStore {
  private readonly storePath: string;
  private readonly maxPreferences: number;
  private readonly decayRate: number;
  private preferences: Map<string, UserPreference> = new Map();
  private loaded = false;

  constructor(options: PreferenceStoreOptions) {
    this.storePath = options.storePath;
    this.maxPreferences = options.maxPreferences ?? 500;
    this.decayRate = options.decayRate ?? 0.05;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      const parsed = JSON.parse(data) as UserPreference[];
      for (const pref of parsed) {
        this.preferences.set(pref.key, pref);
      }
    } catch {
      // File doesn't exist yet, start empty
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const dir = path.dirname(this.storePath);
    await fs.mkdir(dir, { recursive: true });

    const data = JSON.stringify([...this.preferences.values()], null, 2);
    await fs.writeFile(this.storePath, data, 'utf-8');
  }

  /**
   * Set or update a user preference.
   */
  async setPreference(input: UserPreferenceInput): Promise<UserPreference> {
    await this.ensureLoaded();

    const existing = this.preferences.get(input.key);
    const now = new Date().toISOString();

    if (existing) {
      // Update existing preference — increase confidence with evidence
      const newConfidence = Math.min(
        existing.confidence + (input.confidence ?? 0.1),
        1.0,
      );

      const updated: UserPreference = {
        ...existing,
        value: input.value,
        category: input.category,
        confidence: newConfidence,
        lastSeen: now,
        evidenceCount: existing.evidenceCount + 1,
      };

      this.preferences.set(input.key, updated);
    } else {
      // Create new preference
      const newPref: UserPreference = {
        key: input.key,
        value: input.value,
        category: input.category,
        confidence: input.confidence ?? 0.5,
        lastSeen: now,
        evidenceCount: 1,
      };

      this.preferences.set(input.key, newPref);

      // Enforce max preferences limit
      if (this.preferences.size > this.maxPreferences) {
        this.evictLowConfidence();
      }
    }

    await this.persist();
    return this.preferences.get(input.key)!;
  }

  /**
   * Get a specific user preference.
   */
  async getPreference(key: string): Promise<UserPreference | undefined> {
    await this.ensureLoaded();
    return this.preferences.get(key);
  }

  /**
   * List all user preferences, optionally filtered by category.
   */
  async listPreferences(category?: PreferenceCategory): Promise<UserPreference[]> {
    await this.ensureLoaded();

    const all = [...this.preferences.values()];

    if (category) {
      return all.filter((p) => p.category === category);
    }

    return all.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Apply time-based decay to all preferences.
   * Preferences that haven't been seen recently lose confidence.
   */
  async applyDecay(): Promise<number> {
    await this.ensureLoaded();

    let decayed = 0;
    const now = Date.now();

    for (const [key, pref] of this.preferences) {
      const lastSeen = new Date(pref.lastSeen).getTime();
      const daysSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60 * 24);

      if (daysSinceLastSeen > 7) {
        const decayedConfidence = pref.confidence * Math.pow(1 - this.decayRate, daysSinceLastSeen / 7);

        if (decayedConfidence < 0.1) {
          // Remove very low confidence preferences
          this.preferences.delete(key);
          decayed++;
        } else {
          this.preferences.set(key, {
            ...pref,
            confidence: decayedConfidence,
          });
        }
      }
    }

    if (decayed > 0) {
      await this.persist();
    }

    return decayed;
  }

  /**
   * Remove preferences with the lowest confidence when over limit.
   */
  private evictLowConfidence(): void {
    const sorted = [...this.preferences.entries()].sort(
      (a, b) => a[1].confidence - b[1].confidence,
    );

    const toRemove = sorted.slice(0, sorted.length - this.maxPreferences);
    for (const [key] of toRemove) {
      this.preferences.delete(key);
    }
  }

  /**
   * Get statistics about stored preferences.
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    avgConfidence: number;
  }> {
    await this.ensureLoaded();

    const all = [...this.preferences.values()];
    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;

    for (const pref of all) {
      byCategory[pref.category] = (byCategory[pref.category] ?? 0) + 1;
      totalConfidence += pref.confidence;
    }

    return {
      total: all.length,
      byCategory,
      avgConfidence: all.length > 0 ? totalConfidence / all.length : 0,
    };
  }
}
