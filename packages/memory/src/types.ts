/**
 * `memory` domain — type definitions for persistent cross-session memory.
 *
 * Categories map to different kinds of knowledge the agent retains:
 * - `fact`: concrete facts learned during conversations
 * - `preference`: user preferences and settings
 * - `pattern`: recurring patterns in user behavior
 * - `skill`: skills created or updated from experience
 * - `context`: general contextual information
 */

export type MemoryCategory = 'fact' | 'preference' | 'pattern' | 'skill' | 'context';

export interface MemoryEntry {
  readonly id: number;
  readonly sessionId: string;
  readonly category: MemoryCategory;
  readonly content: string;
  readonly metadata: Record<string, unknown>;
  readonly sourceSession: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MemoryEntryInput {
  readonly sessionId: string;
  readonly category: MemoryCategory;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
  readonly sourceSession?: string;
}

export interface UserPreference {
  readonly id: number;
  readonly key: string;
  readonly value: string;
  readonly category: string;
  readonly confidence: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserPreferenceInput {
  readonly key: string;
  readonly value: string;
  readonly category: string;
  readonly confidence?: number;
}

export interface SkillExperience {
  readonly id: number;
  readonly skillName: string;
  readonly action: 'created' | 'updated' | 'archived';
  readonly content: string;
  readonly sessionId: string;
  readonly createdAt: string;
}

export interface SkillExperienceInput {
  readonly skillName: string;
  readonly action: 'created' | 'updated' | 'archived';
  readonly content: string;
  readonly sessionId: string;
}

export interface SearchResult {
  readonly entry: MemoryEntry;
  readonly rank: number;
  readonly snippet: string;
}

export interface MemoryDbOptions {
  readonly dbPath: string;
  readonly readOnly?: boolean;
}
