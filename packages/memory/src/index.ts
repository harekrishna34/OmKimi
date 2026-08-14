/**
 * `@moonshot-ai/memory` — Persistent cross-session memory for Kimi Code.
 *
 * Provides SQLite-backed storage with FTS5 full-text search for:
 * - Memory entries (facts, preferences, patterns, skills, context)
 * - User preferences with confidence scoring
 * - Skill experiences (created/updated/archived from experience)
 *
 * Usage:
 * ```ts
 * import { MemoryManager } from '@moonshot-ai/memory';
 *
 * const memory = new MemoryManager({ dbPath: '~/.kimi-code/memory.db' });
 *
 * // Store a memory
 * memory.remember('User prefers TypeScript over JavaScript', 'preference');
 *
 * // Recall memories
 * const results = memory.recall('TypeScript preference');
 *
 * // Generate system prompt block
 * const block = memory.getFullContextBlock();
 * ```
 */

export { MemoryDb } from './memory-db.js';
export { MemoryManager } from './memory-manager.js';
export type {
  MemoryCategory,
  MemoryEntry,
  MemoryEntryInput,
  MemoryDbOptions,
  SearchResult,
  SkillExperience,
  SkillExperienceInput,
  UserPreference,
  UserPreferenceInput,
} from './types.js';
