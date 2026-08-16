/**
 * Knowledge System Types
 *
 * Inspired by Manus AI's Knowledge recall feature.
 * Stores user preferences, patterns, and learned behaviors.
 */

/** Knowledge entry categories */
export type KnowledgeCategory =
  | 'preference'    // User preferences (language, style, etc.)
  | 'pattern'       // Learned patterns from interactions
  | 'fact'          // Factual information
  | 'skill'         // Skill-related knowledge
  | 'context';      // Contextual information

/** A single knowledge entry */
export interface KnowledgeEntry {
  /** Unique identifier */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** When this knowledge should be used */
  readonly useWhen: string;
  /** The actual knowledge content */
  readonly content: string;
  /** Category for organization */
  readonly category: KnowledgeCategory;
  /** Confidence level (0-1) */
  readonly confidence: number;
  /** When this was created */
  readonly createdAt: string;
  /** When this was last updated */
  readonly updatedAt: string;
  /** Session ID where this was learned (optional) */
  readonly sessionId?: string;
  /** How many times this has been recalled */
  readonly recallCount: number;
}

/** Knowledge search result */
export interface KnowledgeSearchResult {
  /** The matched entry */
  readonly entry: KnowledgeEntry;
  /** Relevance score (0-1) */
  readonly score: number;
  /** Matched snippet for preview */
  readonly snippet: string;
}

/** Knowledge recall event - shown in chat */
export interface KnowledgeRecallEvent {
  /** Which knowledge entries were recalled */
  readonly entries: readonly KnowledgeEntry[];
  /** Why they were recalled (context) */
  readonly reason: string;
  /** Timestamp */
  readonly timestamp: string;
}
