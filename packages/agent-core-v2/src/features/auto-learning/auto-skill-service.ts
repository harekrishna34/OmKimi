/**
 * `auto-learning` domain — `AutoSkillService`: self-learning skill creation.
 *
 * After each conversation turn, reviews the conversation to identify
 * skill-worthy patterns and automatically creates/updates skills.
 * Inspired by Hermes Agent's background_review.py pattern.
 *
 * Gated behind the `auto_learning` experimental flag.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { createDecorator, type ServiceIdentifier } from '#/_base/di/instantiation';
import { Service } from '#/_base/di/service';

import type {
  AutoSkillConfig,
  CuratorReport,
  SkillCreationInput,
  SkillReviewResult,
  SkillUpdateInput,
} from './types.js';
import { DEFAULT_AUTO_SKILL_CONFIG } from './types.js';
import {
  buildCreationPrompt,
  buildReviewPrompt,
  buildUpdatePrompt,
  type ConversationMessage,
} from './skill-review-prompt.js';

export interface IAutoSkillService {
  readonly _serviceBrand: undefined;

  /**
   * Review a conversation turn and decide if a skill should be created/updated.
   */
  reviewTurn(conversation: readonly ConversationMessage[]): Promise<SkillReviewResult>;

  /**
   * Create a new skill from identified experience.
   */
  createSkillFromExperience(input: SkillCreationInput): Promise<string>;

  /**
   * Update an existing skill based on new experience.
   */
  updateExistingSkill(input: SkillUpdateInput): Promise<void>;

  /**
   * Archive a skill that's no longer useful.
   */
  archiveSkill(skillPath: string): Promise<void>;

  /**
   * Run the curator to maintain all auto-generated skills.
   */
  runCurator(skillsDir: string): Promise<CuratorReport>;

  /**
   * Get the configuration.
   */
  getConfig(): AutoSkillConfig;
}

export const IAutoSkillService: ServiceIdentifier<IAutoSkillService> =
  createDecorator<IAutoSkillService>('autoSkillService');

export class AutoSkillService extends Service implements IAutoSkillService {
  declare readonly _serviceBrand: undefined;

  private readonly skillConfig: AutoSkillConfig;
  private readonly autoSkillsDir: string;

  constructor(
    skillsDir: string,
    config: Partial<AutoSkillConfig> = {},
  ) {
    super();
    this.skillConfig = { ...DEFAULT_AUTO_SKILL_CONFIG, ...config };
    this.autoSkillsDir = path.join(skillsDir, 'auto-generated');
  }

  async reviewTurn(conversation: readonly ConversationMessage[]): Promise<SkillReviewResult> {
    if (!this.skillConfig.enabled) {
      return {
        shouldCreateSkill: false,
        shouldUpdateSkill: false,
        reasoning: 'Auto-learning is disabled',
      };
    }

    // Build the review prompt
    const prompt = buildReviewPrompt(conversation);

    // For now, return a default result — actual LLM integration would go here
    // In production, this would call the LLM to analyze the conversation
    const defaultResult: SkillReviewResult = {
      shouldCreateSkill: false,
      shouldUpdateSkill: false,
      reasoning: 'No skill-worthy patterns identified (LLM integration pending)',
    };

    return defaultResult;
  }

  async createSkillFromExperience(input: SkillCreationInput): Promise<string> {
    // Ensure auto-generated directory exists
    await fs.mkdir(this.autoSkillsDir, { recursive: true });

    // Sanitize name for file system
    const sanitizedName = input.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const skillDir = path.join(this.autoSkillsDir, sanitizedName);
    await fs.mkdir(skillDir, { recursive: true });

    // Build SKILL.md content
    const skillContent = `---
name: ${sanitizedName}
description: ${input.description}
metadata:
  auto-generated: true
  source-session: ${input.sourceSession}
  created-at: ${new Date().toISOString()}
---

${input.content}
`;

    const skillPath = path.join(skillDir, 'SKILL.md');
    await fs.writeFile(skillPath, skillContent, 'utf-8');

    return skillPath;
  }

  async updateExistingSkill(input: SkillUpdateInput): Promise<void> {
    const skillPath = path.join(input.skillPath, 'SKILL.md');

    // Read existing skill
    const existing = await fs.readFile(skillPath, 'utf-8');

    // Parse frontmatter and body
    const frontmatterMatch = existing.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      throw new Error(`Invalid skill format at ${skillPath}`);
    }

    const frontmatter = frontmatterMatch[1] ?? '';
    const body = frontmatterMatch[2] ?? '';

    // Update the frontmatter to mark as updated
    const updatedFrontmatter = frontmatter
      .replace(/updated-at:.*$/m, `updated-at: ${new Date().toISOString()}`)
      .replace(/(auto-generated: true)/, '$1\n  updated: true');

    // Build updated content
    const updatedContent = `---
${updatedFrontmatter}
---

${input.updates.content ?? body}
`;

    await fs.writeFile(skillPath, updatedContent, 'utf-8');
  }

  async archiveSkill(skillPath: string): Promise<void> {
    const archiveDir = path.join(path.dirname(skillPath), '..', 'archived');
    await fs.mkdir(archiveDir, { recursive: true });

    const skillName = path.basename(skillPath);
    const archivePath = path.join(archiveDir, `${skillName}.archived`);

    // Move to archive
    await fs.rename(skillPath, archivePath);
  }

  async runCurator(skillsDir: string): Promise<CuratorReport> {
    const report: CuratorReport = {
      timestamp: new Date().toISOString(),
      skillsReviewed: 0,
      skillsArchived: 0,
      skillsConsolidated: 0,
      skillsPatched: 0,
      details: [],
    };

    try {
      // Check if auto-generated directory exists
      const autoDir = path.join(skillsDir, 'auto-generated');
      const exists = await fs
        .access(autoDir)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        report.details.push('No auto-generated skills directory found');
        return report;
      }

      // List all auto-generated skills
      const entries = await fs.readdir(autoDir, { withFileTypes: true });
      const skillDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

      report.skillsReviewed = skillDirs.length;

      // Check each skill for staleness
      for (const dir of skillDirs) {
        const skillPath = path.join(autoDir, dir.name, 'SKILL.md');

        try {
          const stat = await fs.stat(skillPath);
          const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);

          if (ageDays > DEFAULT_AUTO_SKILL_CONFIG.archiveAfterDays) {
            report.details.push(`Stale skill found: ${dir.name} (${ageDays.toFixed(1)} days old)`);
            // Don't auto-archive, just report
          }
        } catch {
          report.details.push(`Could not read skill: ${dir.name}`);
        }
      }
    } catch (error) {
      report.details.push(`Curator error: ${error}`);
    }

    return report;
  }

  getConfig(): AutoSkillConfig {
    return { ...this.skillConfig };
  }
}
