/**
 * `user-modeling` domain — `UserModelingFeature`: user preference tracking.
 *
 * Registers the `IUserModelingService` at Agent scope and contributes the
 * `user_modeling` experimental flag. Gated behind the flag — when disabled,
 * the service returns no-op results.
 *
 * Registered into the feature table at import.
 */

import { type FlagDefinitionInput, registerFlagDefinition } from '#/app/flag/flagRegistry';
import { Feature } from '#/features/feature';
import { registerFeature } from '#/features/featureRegistry';

import { UserModelingService, IUserModelingService } from './user-modeling-service.js';

// ─── Flag ───────────────────────────────────────────────────────────

export const userModelingFlag: FlagDefinitionInput = {
  id: 'user_modeling',
  title: 'User modeling',
  description:
    'Track user preferences and patterns to personalize agent behavior across sessions.',
  env: 'KIMI_CODE_EXPERIMENTAL_USER_MODELING',
  default: false,
  surface: 'core',
};

registerFlagDefinition(userModelingFlag);

// ─── Feature ────────────────────────────────────────────────────────

export class UserModelingFeature extends Feature {
  static override readonly name = 'user-modeling';

  constructor() {
    super();

    // Register the UserModelingService at Agent scope
    this.contributeAgentService(
      IUserModelingService,
      UserModelingService as unknown as new (...args: never[]) => UserModelingService,
    );
  }
}

registerFeature(UserModelingFeature);
