/**
 * Knowledge Recalled Component
 *
 * Shows in the chat when knowledge entries are recalled.
 * Similar to Manus AI's "Knowledge recalled (N)" indicator.
 */

import { Container, Text } from '@moonshot-ai/pi-tui';

import { currentTheme } from '#/tui/theme';

import type { KnowledgeEntry, KnowledgeRecallEvent } from './types';

interface KnowledgeRecalledOptions {
  /** The recall event to display */
  readonly event: KnowledgeRecallEvent;
  /** Callback when user wants to view/edit knowledge */
  readonly onViewKnowledge?: (entry: KnowledgeEntry) => void;
  /** Whether this is expanded to show details */
  readonly expanded?: boolean;
}

/**
 * Creates a "Knowledge recalled" component for the transcript
 *
 * Visual format:
 * ┌─────────────────────────────────────┐
 * │ 💡 Knowledge recalled (2)          │
 * │   Language preference               │
 * │   Direct download links preference  │
 * └─────────────────────────────────────┘
 */
export function createKnowledgeRecalledComponent(
  options: KnowledgeRecalledOptions
): Container {
  const { event, expanded = false } = options;
  const container = new Container();

  // Header with icon and count
  const headerText = `💡 Knowledge recalled (${event.entries.length})`;
  container.addChild(new Text(currentTheme.fg('text', headerText), 0, 0));

  // Show entry names if expanded
  if (expanded && event.entries.length > 0) {
    for (const entry of event.entries) {
      container.addChild(new Text(`    ${currentTheme.dim(entry.name)}`, 0, 0));
    }
  }

  return container;
}

/**
 * Creates a compact "Knowledge recalled" inline text
 * Used in the transcript flow
 */
export function createKnowledgeRecalledInline(
  event: KnowledgeRecallEvent
): Text {
  const names = event.entries.map((e) => e.name).join(', ');
  const text = `💡 Knowledge recalled (${event.entries.length}): ${names}`;
  return new Text(currentTheme.dim(text), 0, 0);
}

/**
 * Format knowledge recall for display
 */
export function formatKnowledgeRecall(event: KnowledgeRecallEvent): string[] {
  const lines: string[] = [];

  // Header
  lines.push(`💡 Knowledge recalled (${event.entries.length})`);

  // Entry names
  for (const entry of event.entries) {
    lines.push(`   ${entry.name}`);
  }

  return lines;
}
