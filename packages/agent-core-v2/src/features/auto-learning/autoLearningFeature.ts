/**
 * `auto-learning` domain — `AutoLearningFeature`: self-learning skill capability.
 *
 * Registers the `IAutoSkillService` at Agent scope and contributes the
 * `auto_learning` experimental flag. Gated behind the flag — when disabled,
 * the service returns no-op results.
 *
 * Registered into the feature table at import.
 */

import { type FlagDefinitionInput, registerFlagDefinition } from '#/app/flag/flagRegistry';
import { Feature } from '#/features/feature';
import { registerFeature } from '#/features/featureRegistry';

import { AutoSkillService, IAutoSkillService } from './auto-skill-service.js';

// ─── Flag ───────────────────────────────────────────────────────────

export const autoLearningFlag: FlagDefinitionInput = {
  id: 'auto_learning',
  title: 'Auto-learning skills',
  description:
    'Automatically create and maintain skills based on conversation experience.',
  env: 'KIMI_CODE_EXPERIMENTAL_AUTO_LEARNING',
  default: false,
  surface: 'core',
};

registerFlagDefinition(autoLearningFlag);

// ─── Feature ────────────────────────────────────────────────────────

export class AutoLearningFeature extends Feature {
  static override readonly name = 'auto-learning';

  constructor() {
    super();

    // Register the AutoSkillService at Agent scope
    // The actual skills directory path would be resolved at runtime
    this.contributeAgentService(
      IAutoSkillService,
      AutoSkillService as unknown as new (...args: never[]) => AutoSkillService,
    );
  }
}

registerFeature(AutoLearningFeature);
