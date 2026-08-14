/**
 * `user-modeling` domain — preference extraction from conversations.
 *
 * Analyzes conversation messages to extract user preferences using
 * heuristics and pattern matching.
 */

import type { InteractionEvent, PreferenceExtractionResult, UserPreferenceInput } from './types.js';

// ─── Coding Style Extraction ────────────────────────────────────────

const LANGUAGE_PATTERNS: Array<{ pattern: RegExp; language: string }> = [
  { pattern: /\btypescript\b/i, language: 'TypeScript' },
  { pattern: /\bjavascript\b/i, language: 'JavaScript' },
  { pattern: /\bpython\b/i, language: 'Python' },
  { pattern: /\brust\b/i, language: 'Rust' },
  { pattern: /\bgo(lang)?\b/i, language: 'Go' },
  { pattern: /\bjava\b/i, language: 'Java' },
  { pattern: /\bc\+\+\b/i, language: 'C++' },
  { pattern: /\bc#\b/i, language: 'C#' },
];

const NAMING_PATTERNS: Array<{ pattern: RegExp; style: string }> = [
  { pattern: /\b(camelCase|camel_case)\b/i, style: 'camelCase' },
  { pattern: /\b(PascalCase|pascal_case)\b/i, style: 'PascalCase' },
  { pattern: /\b(snake_case|snakecase)\b/i, style: 'snake_case' },
  { pattern: /\b(kebab-case|kebabcase)\b/i, style: 'kebab-case' },
];

/**
 * Extract coding style preferences from messages.
 */
export function extractCodingStyle(messages: readonly InteractionEvent[]): UserPreferenceInput[] {
  const preferences: UserPreferenceInput[] = [];
  const languageCounts = new Map<string, number>();
  const styleCounts = new Map<string, number>();

  for (const msg of messages) {
    if (msg.type !== 'message' && msg.type !== 'code_edit') continue;

    // Count language mentions
    for (const { pattern, language } of LANGUAGE_PATTERNS) {
      if (pattern.test(msg.content)) {
        languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
      }
    }

    // Count naming style mentions
    for (const { pattern, style } of NAMING_PATTERNS) {
      if (pattern.test(msg.content)) {
        styleCounts.set(style, (styleCounts.get(style) ?? 0) + 1);
      }
    }
  }

  // Extract dominant language
  if (languageCounts.size > 0) {
    const sorted = [...languageCounts.entries()].sort((a, b) => b[1] - a[1]);
    const [topLang, count] = sorted[0]!;
    const confidence = Math.min(count / messages.length, 1);

    preferences.push({
      key: 'primary_language',
      value: topLang,
      category: 'coding_style',
      confidence,
    });
  }

  // Extract dominant naming style
  if (styleCounts.size > 0) {
    const sorted = [...styleCounts.entries()].sort((a, b) => b[1] - a[1]);
    const [topStyle, count] = sorted[0]!;
    const confidence = Math.min(count / messages.length, 1);

    preferences.push({
      key: 'naming_convention',
      value: topStyle,
      category: 'coding_style',
      confidence,
    });
  }

  return preferences;
}

// ─── Tool Preferences Extraction ────────────────────────────────────

/**
 * Extract tool usage preferences from events.
 */
export function extractToolPreferences(events: readonly InteractionEvent[]): UserPreferenceInput[] {
  const preferences: UserPreferenceInput[] = [];
  const toolCounts = new Map<string, number>();

  for (const event of events) {
    if (event.type === 'tool_use' && event.metadata?.['toolName']) {
      const toolName = event.metadata['toolName'] as string;
      toolCounts.set(toolName, (toolCounts.get(toolName) ?? 0) + 1);
    }
  }

  // Extract top tools
  if (toolCounts.size > 0) {
    const sorted = [...toolCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topTools = sorted.slice(0, 5).map(([name, count]) => ({
      name,
      confidence: Math.min(count / events.length, 1),
    }));

    preferences.push({
      key: 'frequently_used_tools',
      value: topTools.map((t) => t.name).join(', '),
      category: 'tool_preferences',
      confidence: topTools[0]?.confidence ?? 0.5,
    });
  }

  return preferences;
}

// ─── Communication Style Extraction ─────────────────────────────────

const FORMALITY_PATTERNS = [
  { pattern: /\bplease\b/i, weight: 0.1 },
  { pattern: /\bthank(s| you)\b/i, weight: 0.1 },
  { pattern: /\bcould you\b/i, weight: 0.1 },
  { pattern: /\bwould you\b/i, weight: 0.1 },
  { pattern: /\bhey\b/i, weight: -0.1 },
  { pattern: /\bhi\b/i, weight: -0.05 },
  { pattern: /\bok\b/i, weight: -0.1 },
  { pattern: /\byo\b/i, weight: -0.15 },
];

/**
 * Extract communication style preferences.
 */
export function extractCommunicationStyle(
  messages: readonly InteractionEvent[],
): UserPreferenceInput[] {
  const preferences: UserPreferenceInput[] = [];
  let formalityScore = 0;
  let messageCount = 0;

  for (const msg of messages) {
    if (msg.type !== 'message' || msg.content.length < 10) continue;
    messageCount++;

    for (const { pattern, weight } of FORMALITY_PATTERNS) {
      if (pattern.test(msg.content)) {
        formalityScore += weight;
      }
    }
  }

  if (messageCount > 0) {
    const normalizedScore = formalityScore / messageCount;
    const style = normalizedScore > 0.05 ? 'formal' : normalizedScore < -0.05 ? 'casual' : 'neutral';

    preferences.push({
      key: 'communication_style',
      value: style,
      category: 'communication_style',
      confidence: Math.min(Math.abs(normalizedScore) * 5, 1),
    });
  }

  return preferences;
}

// ─── Project Patterns Extraction ────────────────────────────────────

const FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; framework: string }> = [
  { pattern: /\breact\b/i, framework: 'React' },
  { pattern: /\bvue\b/i, framework: 'Vue' },
  { pattern: /\bangular\b/i, framework: 'Angular' },
  { pattern: /\bnext\.?js\b/i, framework: 'Next.js' },
  { pattern: /\bexpress\b/i, framework: 'Express' },
  { pattern: /\bfastify\b/i, framework: 'Fastify' },
  { pattern: /\bnest\.?js\b/i, framework: 'NestJS' },
  { pattern: /\bprisma\b/i, framework: 'Prisma' },
  { pattern: /\bdrizzle\b/i, framework: 'Drizzle' },
];

/**
 * Extract project pattern preferences.
 */
export function extractProjectPatterns(
  messages: readonly InteractionEvent[],
): UserPreferenceInput[] {
  const preferences: UserPreferenceInput[] = [];
  const frameworkCounts = new Map<string, number>();

  for (const msg of messages) {
    if (msg.type !== 'message' && msg.type !== 'code_edit') continue;

    for (const { pattern, framework } of FRAMEWORK_PATTERNS) {
      if (pattern.test(msg.content)) {
        frameworkCounts.set(framework, (frameworkCounts.get(framework) ?? 0) + 1);
      }
    }
  }

  if (frameworkCounts.size > 0) {
    const sorted = [...frameworkCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topFrameworks = sorted.slice(0, 3).map(([name]) => name);

    preferences.push({
      key: 'preferred_frameworks',
      value: topFrameworks.join(', '),
      category: 'project_patterns',
      confidence: 0.7,
    });
  }

  return preferences;
}

// ─── Main Extraction ────────────────────────────────────────────────

/**
 * Extract all preferences from a set of interaction events.
 */
export function extractAllPreferences(
  events: readonly InteractionEvent[],
): PreferenceExtractionResult {
  const preferences: UserPreferenceInput[] = [
    ...extractCodingStyle(events),
    ...extractToolPreferences(events),
    ...extractCommunicationStyle(events),
    ...extractProjectPatterns(events),
  ];

  // Filter out low-confidence results
  const filtered = preferences.filter((p) => (p.confidence ?? 0.5) >= 0.3);

  return {
    preferences: filtered,
    reasoning: `Extracted ${filtered.length} preferences from ${events.length} events`,
  };
}
