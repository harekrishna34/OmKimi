/**
 * `auto-learning` domain — type definitions for self-learning skills system.
 *
 * Inspired by Hermes Agent's background review + curator pattern.
 * Automatically creates and maintains skills based on conversation experience.
 */

export interface SkillReviewResult {
  readonly shouldCreateSkill: boolean;
  readonly shouldUpdateSkill: boolean;
  readonly skillName?: string;
  readonly skillDescription?: string;
  readonly skillContent?: string;
  readonly targetSkillPath?: string;
  readonly reasoning: string;
}

export interface AutoSkillConfig {
  readonly enabled: boolean;
  readonly reviewAfterTurn: boolean;
  readonly curatorIntervalHours: number;
  readonly minIdleHours: number;
  readonly archiveAfterDays: number;
  readonly maxAutoSkills: number;
}

export const DEFAULT_AUTO_SKILL_CONFIG: AutoSkillConfig = {
  enabled: false,
  reviewAfterTurn: true,
  curatorIntervalHours: 24,
  minIdleHours: 4,
  archiveAfterDays: 30,
  maxAutoSkills: 100,
};

export interface SkillCreationInput {
  readonly name: string;
  readonly description: string;
  readonly content: string;
  readonly category?: string;
  readonly sourceSession: string;
}

export interface SkillUpdateInput {
  readonly skillPath: string;
  readonly updates: {
    readonly description?: string;
    readonly content?: string;
  };
  readonly reason: string;
}

export interface CuratorReport {
  readonly timestamp: string;
  skillsReviewed: number;
  skillsArchived: number;
  skillsConsolidated: number;
  skillsPatched: number;
  readonly details: string[];
}
