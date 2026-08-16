// apps/kimi-web/src/i18n/locales/en/knowledge.ts
export default {
  // Dialog titles
  editTitle: 'Edit Knowledge',
  createTitle: 'Create Knowledge',

  // Form fields
  name: 'Name',
  namePlaceholder: 'e.g., Language preference',
  useWhen: 'Use when',
  useWhenPlaceholder: 'e.g., Whenever communicating with the user',
  content: 'Content',
  contentPlaceholder: 'Enter your knowledge content...',

  // Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  close: 'Close',

  // Chat stream recall
  knowledge: {
    recalled: 'Knowledge recalled ({count})',
    noRecalls: 'No knowledge recalled',
  },

  // Settings panel
  settings: {
    title: 'Knowledge',
    description: 'Manage knowledge entries that can be recalled during conversations.',
    addNew: 'Add Knowledge',
    empty: 'No knowledge entries yet. Create one to get started.',
    emptyHint: 'Knowledge entries help the agent remember important information across sessions.',
    import: 'Import',
    export: 'Export',
    totalEntries: '{count} entries',
    activeEntries: '{count} active',
  },

  // Confirmation dialogs
  confirm: {
    deleteTitle: 'Delete Knowledge',
    deleteMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    discardTitle: 'Discard Changes',
    discardMessage: 'You have unsaved changes. Are you sure you want to close?',
  },

  // Validation
  validation: {
    nameRequired: 'Name is required',
    contentRequired: 'Content is required',
    contentMaxLength: 'Content must be 2000 characters or less',
  },
};
