/**
 * `memory` domain — high-level memory manager.
 *
 * Provides the main API for storing, recalling, and managing memories.
 * Generates system prompt blocks for LLM context injection.
 */

import { MemoryDb } from './memory-db.js';
import type {
  MemoryCategory,
  MemoryEntry,
  MemoryEntryInput,
  SearchResult,
  SkillExperienceInput,
  UserPreference,
  UserPreferenceInput,
} from './types.js';

export interface MemoryManagerOptions {
  readonly dbPath: string;
}

export class MemoryManager {
  private readonly db: MemoryDb;

  constructor(options: MemoryManagerOptions) {
    this.db = new MemoryDb({ dbPath: options.dbPath });
  }

  // ─── Memory CRUD ──────────────────────────────────────────────────

  /**
   * Store a new memory entry.
   */
  remember(
    content: string,
    category: MemoryCategory,
    options: { sessionId?: string; metadata?: Record<string, unknown> } = {},
  ): MemoryEntry {
    return this.db.createMemory({
      sessionId: options.sessionId ?? 'global',
      category,
      content,
      metadata: options.metadata,
    });
  }

  /**
   * Search memories relevant to a query using FTS5 full-text search.
   */
  recall(query: string, limit: number = 10): SearchResult[] {
    return this.db.searchMemory(query, limit);
  }

  /**
   * Get a specific memory by ID.
   */
  getMemory(id: number): MemoryEntry | undefined {
    return this.db.getMemory(id);
  }

  /**
   * Update an existing memory.
   */
  updateMemory(id: number, updates: { content?: string; metadata?: Record<string, unknown> }): void {
    this.db.updateMemory(id, updates);
  }

  /**
   * Soft-delete a memory (actually deletes from DB).
   */
  forget(id: number): void {
    this.db.deleteMemory(id);
  }

  /**
   * List memories with optional filtering.
   */
  listMemories(
    options: { category?: MemoryCategory; sessionId?: string; limit?: number; offset?: number } = {},
  ): MemoryEntry[] {
    return this.db.listMemories(options);
  }

  // ─── User Preferences ─────────────────────────────────────────────

  /**
   * Store or update a user preference.
   */
  trackPreference(key: string, value: string, category: string = 'general'): UserPreference {
    return this.db.setPreference({ key, value, category });
  }

  /**
   * Get a specific user preference.
   */
  getPreference(key: string): UserPreference | undefined {
    return this.db.getPreference(key);
  }

  /**
   * List all user preferences, optionally filtered by category.
   */
  listPreferences(category?: string): UserPreference[] {
    return this.db.listPreferences(category);
  }

  // ─── Skill Experiences ────────────────────────────────────────────

  /**
   * Record a skill experience (created/updated/archived).
   */
  recordSkillExperience(input: SkillExperienceInput): void {
    this.db.recordSkillExperience(input);
  }

  /**
   * List skill experiences.
   */
  listSkillExperiences(options: { skillName?: string; action?: string; limit?: number } = {}) {
    return this.db.listSkillExperiences(options);
  }

  // ─── Memory Consolidation ─────────────────────────────────────────

  /**
   * Find and merge duplicate memories.
   * Simple heuristic: memories with >80% similarity in the same category.
   */
  consolidate(): { merged: number; removed: number } {
    const categories: MemoryCategory[] = ['fact', 'preference', 'pattern', 'skill', 'context'];
    let merged = 0;
    let removed = 0;

    for (const category of categories) {
      const memories = this.db.listMemories({ category, limit: 200 });

      // Simple deduplication: exact content match
      const seen = new Map<string, MemoryEntry>();
      for (const mem of memories) {
        const normalized = mem.content.trim().toLowerCase();
        if (seen.has(normalized)) {
          // Keep the newer one, remove the older
          this.db.deleteMemory(mem.id);
          removed++;
        } else {
          seen.set(normalized, mem);
        }
      }
    }

    return { merged, removed };
  }

  // ─── System Prompt Generation ─────────────────────────────────────

  /**
   * Generate a memory context block for system prompt injection.
   * Retrieves the most recent memories across all categories.
   */
  getSystemPromptBlock(maxEntries: number = 20): string {
    const memories = this.db.listMemories({ limit: maxEntries });
    if (memories.length === 0) return '';

    const lines: string[] = ['## Stored Memory', ''];
    for (const mem of memories) {
      lines.push(`- [${mem.category}] ${mem.content}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate a user preferences block for system prompt injection.
   */
  getUserPreferencesBlock(): string {
    const preferences = this.db.listPreferences();
    if (preferences.length === 0) return '';

    const grouped = new Map<string, UserPreference[]>();
    for (const pref of preferences) {
      const group = grouped.get(pref.category) ?? [];
      group.push(pref);
      grouped.set(pref.category, group);
    }

    const lines: string[] = ['## User Preferences', ''];
    for (const [category, prefs] of grouped) {
      lines.push(`### ${category}`);
      for (const pref of prefs) {
        lines.push(`- **${pref.key}**: ${pref.value} (confidence: ${(pref.confidence * 100).toFixed(0)}%)`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate a combined context block for system prompt injection.
   */
  getFullContextBlock(): string {
    const parts = [this.getSystemPromptBlock(), this.getUserPreferencesBlock()].filter(Boolean);
    return parts.join('\n\n');
  }

  // ─── Utility ──────────────────────────────────────────────────────

  getStats(): { memories: number; preferences: number; skillExperiences: number } {
    return this.db.getStats();
  }

  close(): void {
    this.db.close();
  }
}
