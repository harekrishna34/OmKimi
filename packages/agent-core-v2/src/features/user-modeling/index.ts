/**
 * `user-modeling` domain — public API.
 *
 * User preference tracking system that learns from conversations
 * and personalizes agent behavior.
 */

export { UserModelingService, IUserModelingService } from './user-modeling-service.js';
export { UserModelingFeature, userModelingFlag } from './userModelingFeature.js';
export {
  extractCodingStyle,
  extractToolPreferences,
  extractCommunicationStyle,
  extractProjectPatterns,
  extractAllPreferences,
} from './preference-extractor.js';
export { PreferenceStore } from './preference-store.js';
export type {
  InteractionEvent,
  PreferenceCategory,
  PreferenceExtractionResult,
  UserPreference,
  UserPreferenceInput,
  UserModelingConfig,
} from './types.js';
export { DEFAULT_USER_MODELING_CONFIG } from './types.js';
