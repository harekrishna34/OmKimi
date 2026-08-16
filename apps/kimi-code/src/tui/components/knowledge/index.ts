/**
 * Knowledge System - Index
 *
 * Exports all knowledge-related components and utilities.
 * Inspired by Manus AI's Knowledge recall feature.
 */

// Types
export type {
  KnowledgeEntry,
  KnowledgeCategory,
  KnowledgeSearchResult,
  KnowledgeRecallEvent,
} from './types';

// Store functions
export {
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getKnowledge,
  listKnowledge,
  searchKnowledge,
  recallKnowledge,
  getKnowledgeStats,
  clearKnowledge,
} from './knowledge-store';

// UI Components
export {
  createKnowledgeRecalledComponent,
  createKnowledgeRecalledInline,
  formatKnowledgeRecall,
} from './knowledge-recalled';

export { EditKnowledgeDialog, createEditKnowledgeDialog } from './edit-knowledge-dialog';
