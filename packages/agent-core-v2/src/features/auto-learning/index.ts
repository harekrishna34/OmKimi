/**
 * `auto-learning` domain — public API.
 *
 * Self-learning skills system that automatically creates and maintains
 * skills based on conversation experience.
 */

export { AutoSkillService, IAutoSkillService } from './auto-skill-service.js';
export { AutoLearningFeature, autoLearningFlag } from './autoLearningFeature.js';
export {
  buildReviewPrompt,
  buildCreationPrompt,
  buildUpdatePrompt,
  type ConversationMessage,
} from './skill-review-prompt.js';
export type {
  AutoSkillConfig,
  CuratorReport,
  SkillCreationInput,
  SkillReviewResult,
  SkillUpdateInput,
} from './types.js';
export { DEFAULT_AUTO_SKILL_CONFIG } from './types.js';
