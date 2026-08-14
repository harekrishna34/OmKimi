/**
 * `auto-learning` domain — prompt templates for skill review and creation.
 *
 * These prompts are used by the AutoSkillService to analyze conversations
 * and decide whether to create/update skills based on experience.
 */

export interface ConversationMessage {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
}

/**
 * Build a prompt for reviewing a conversation turn to identify skill-worthy patterns.
 */
export function buildReviewPrompt(conversation: readonly ConversationMessage[]): string {
  const conversationText = conversation
    .map((msg) => `${msg.role}: ${msg.content.substring(0, 500)}`)
    .join('\n\n');

  return `You are a skill reviewer for an AI coding assistant. Analyze this conversation and determine if any reusable skill should be created or updated.

## Conversation:
${conversationText}

## Task:
1. Identify if there are any repeatable patterns, workflows, or knowledge that could be turned into a reusable skill.
2. A skill is worth creating if:
   - It represents a common workflow the user might repeat
   - It contains specific knowledge about tools, patterns, or conventions
   - It captures a debugging approach or problem-solving technique
3. A skill is NOT worth creating if:
   - It's a one-off task unlikely to repeat
   - It's too generic (e.g., "write code")
   - It's already covered by existing skills

## Response Format (JSON):
{
  "shouldCreateSkill": boolean,
  "shouldUpdateSkill": boolean,
  "skillName": "string (kebab-case, max 64 chars)",
  "skillDescription": "string (max 1024 chars)",
  "skillContent": "string (full SKILL.md body)",
  "targetSkillPath": "string (path to existing skill if updating)",
  "reasoning": "string (brief explanation)"
}

Respond ONLY with the JSON object.`;
}

/**
 * Build a prompt for creating a skill from an identified pattern.
 */
export function buildCreationPrompt(pattern: string): string {
  return `You are a skill author for an AI coding assistant. Create a reusable skill based on this observed pattern.

## Observed Pattern:
${pattern}

## Skill Format (SKILL.md with YAML frontmatter):
\`\`\`
---
name: skill-name
description: Brief description (max 1024 chars)
---

# Skill Title

## When to Use
Describe when this skill should be activated.

## Instructions
Step-by-step instructions for executing this skill.

## Examples
Provide concrete examples.

## Verification
How to verify the skill worked correctly.
\`\`\`

## Requirements:
- Name must be kebab-case, max 64 characters
- Description must be clear and concise
- Instructions must be actionable and specific
- Include at least one example
- Include verification steps

Create the complete SKILL.md content.`;
}

/**
 * Build a prompt for updating an existing skill based on new experience.
 */
export function buildUpdatePrompt(
  existingSkillName: string,
  existingContent: string,
  feedback: string,
): string {
  return `You are a skill maintainer for an AI coding assistant. Update an existing skill based on new experience.

## Existing Skill: ${existingSkillName}
${existingContent}

## New Experience/Feedback:
${feedback}

## Task:
Analyze the feedback and update the skill to incorporate the new knowledge.
- Preserve existing useful content
- Add new information from the feedback
- Remove outdated or incorrect information
- Keep the skill focused and actionable

## Response Format (JSON):
{
  "updatedContent": "string (complete updated SKILL.md body)",
  "changes": ["string (list of changes made)"]
}

Respond ONLY with the JSON object.`;
}
