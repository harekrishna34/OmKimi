/**
 * Edit Knowledge Dialog
 *
 * A modal dialog for creating/editing knowledge entries.
 * Similar to Manus AI's "Edit Knowledge" panel.
 *
 * Fields:
 * - Name: Human-readable name for the knowledge
 * - Use when: When this knowledge should be recalled
 * - Content: The actual knowledge content (max 2000 chars)
 * - Category: preference, pattern, fact, skill, context
 */

import { Container, Text, Input, Key, matchesKey } from '@moonshot-ai/pi-tui';

import { currentTheme } from '#/tui/theme';

import type { KnowledgeEntry, KnowledgeCategory } from './types';
import { addKnowledge, updateKnowledge, deleteKnowledge } from './knowledge-store';

const MAX_CONTENT_LENGTH = 2000;

interface EditKnowledgeDialogOptions {
  /** Existing entry to edit (undefined for new entry) */
  readonly entry?: KnowledgeEntry;
  /** Called when dialog closes */
  readonly onClose: (saved: boolean) => void;
}

/**
 * Edit Knowledge Dialog Component
 *
 * Visual format (similar to Manus):
 * ┌─────────────────────────────────────────────┐
 * │ Edit Knowledge                         [X] │
 * ├─────────────────────────────────────────────┤
 * │ Name                                        │
 * │ ┌─────────────────────────────────────────┐ │
 * │ │ Direct download links preference        │ │
 * │ └─────────────────────────────────────────┘ │
 * │                                             │
 * │ Use when                                    │
 * │ ┌─────────────────────────────────────────┐ │
 * │ │ Whenever providing files or domains     │ │
 * │ └─────────────────────────────────────────┘ │
 * │                                             │
 * │ Content                                     │
 * │ ┌─────────────────────────────────────────┐ │
 * │ │ Always provide direct download links    │ │
 * │ │ for all domains.                        │ │
 * │ │                                         │ │
 * │ │                           53 / 2000     │ │
 * │ └─────────────────────────────────────────┘ │
 * │                                             │
 * │ Category: [preference ▾]                    │
 * │                                             │
 * │ [Delete]        [Cancel]        [Save]      │
 * └─────────────────────────────────────────────┘
 */
export class EditKnowledgeDialog extends Container {
  private nameInput: Input;
  private useWhenInput: Input;
  private contentInput: Input;
  private categoryInput: Input;

  private entry: KnowledgeEntry | undefined;
  private onClose: (saved: boolean) => void;
  private selectedCategory: KnowledgeCategory;

  constructor(options: EditKnowledgeDialogOptions) {
    super();

    this.entry = options.entry;
    this.onClose = options.onClose;
    this.selectedCategory = this.entry?.category ?? 'preference';

    // Header
    const header = new Container();
    header.addChild(new Text(currentTheme.fg('text', ' Edit Knowledge'), 0, 0));
    header.addChild(new Text(currentTheme.dim('  [Esc] Cancel · [Enter] Save'), 0, 0));
    this.addChild(header);

    // Separator
    this.addChild(new Text('─'.repeat(50), 0, 0));

    // Name field
    this.addChild(new Text(currentTheme.fg('text', 'Name'), 0, 0));
    this.nameInput = new Input();
    this.nameInput.setValue(this.entry?.name ?? '');
    this.addChild(this.nameInput);

    // Spacer
    this.addChild(new Text('', 0, 0));

    // Use when field
    this.addChild(new Text(currentTheme.fg('text', 'Use when'), 0, 0));
    this.useWhenInput = new Input();
    this.useWhenInput.setValue(this.entry?.useWhen ?? '');
    this.addChild(this.useWhenInput);

    // Spacer
    this.addChild(new Text('', 0, 0));

    // Content field
    this.addChild(new Text(currentTheme.fg('text', 'Content'), 0, 0));
    this.contentInput = new Input();
    this.contentInput.setValue(this.entry?.content ?? '');
    this.addChild(this.contentInput);

    // Spacer
    this.addChild(new Text('', 0, 0));

    // Category selector
    this.addChild(new Text(currentTheme.fg('text', 'Category'), 0, 0));
    this.categoryInput = new Input();
    this.categoryInput.setValue(this.selectedCategory);
    this.addChild(this.categoryInput);

    // Spacer
    this.addChild(new Text('', 0, 0));

    // Action hint
    this.addChild(new Text(currentTheme.dim('  [Del] Delete · [Esc] Cancel · [Enter] Save'), 0, 0));
  }

  /**
   * Handle keyboard input
   */
  handleInput(data: string): void {
    if (matchesKey(data, Key.escape)) {
      this.handleCancel();
    } else if (matchesKey(data, Key.enter)) {
      this.handleSave();
    } else if (matchesKey(data, Key.delete) || matchesKey(data, Key.backspace)) {
      if (this.entry) {
        this.handleDelete();
      }
    }
  }

  /**
   * Get the current values from inputs
   */
  getValues(): { name: string; useWhen: string; content: string; category: KnowledgeCategory } {
    const content = this.contentInput.getValue().trim();
    const validCategories: KnowledgeCategory[] = ['preference', 'pattern', 'fact', 'skill', 'context'];
    const category = validCategories.includes(this.selectedCategory) ? this.selectedCategory : 'preference';

    return {
      name: this.nameInput.getValue().trim(),
      useWhen: this.useWhenInput.getValue().trim(),
      content,
      category,
    };
  }

  /**
   * Handle save action
   */
  private handleSave(): void {
    const { name, useWhen, content, category } = this.getValues();

    // Validation
    if (!name || !content) {
      return;
    }

    if (this.entry) {
      // Update existing entry
      updateKnowledge(this.entry.id, { name, useWhen, content, category });
    } else {
      // Create new entry
      addKnowledge({ name, useWhen, content, category });
    }

    this.onClose(true);
  }

  /**
   * Handle cancel action
   */
  private handleCancel(): void {
    this.onClose(false);
  }

  /**
   * Handle delete action
   */
  private handleDelete(): void {
    if (this.entry) {
      deleteKnowledge(this.entry.id);
      this.onClose(true);
    }
  }
}

/**
 * Create an Edit Knowledge dialog
 */
export function createEditKnowledgeDialog(
  options: EditKnowledgeDialogOptions
): EditKnowledgeDialog {
  return new EditKnowledgeDialog(options);
}
