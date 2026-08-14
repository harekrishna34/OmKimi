/**
 * `user-modeling` domain — type definitions for user preference tracking.
 *
 * Tracks user patterns and preferences across sessions to personalize
 * the agent's behavior. Inspired by Hermes Agent's Honcho dialectic modeling.
 */

export type PreferenceCategory =
  | 'coding_style'
  | 'tool_preferences'
  | 'communication_style'
  | 'project_patterns'
  | 'error_patterns'
  | 'general';

export interface UserPreference {
  readonly key: string;
  readonly value: string;
  readonly category: PreferenceCategory;
  readonly confidence: number;
  readonly lastSeen: string;
  readonly evidenceCount: number;
}

export interface UserPreferenceInput {
  readonly key: string;
  readonly value: string;
  readonly category: PreferenceCategory;
  readonly confidence?: number;
}

export interface InteractionEvent {
  readonly type: 'message' | 'tool_use' | 'code_edit' | 'error' | 'preference';
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: string;
}

export interface UserModelingConfig {
  readonly enabled: boolean;
  readonly maxPreferences: number;
  readonly minConfidenceThreshold: number;
  readonly decayRate: number;
}

export const DEFAULT_USER_MODELING_CONFIG: UserModelingConfig = {
  enabled: false,
  maxPreferences: 500,
  minConfidenceThreshold: 0.3,
  decayRate: 0.05,
};

export interface PreferenceExtractionResult {
  readonly preferences: readonly UserPreferenceInput[];
  readonly reasoning: string;
}
