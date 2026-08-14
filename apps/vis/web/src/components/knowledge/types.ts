/**
 * Knowledge types for the Knowledge system.
 * Similar to Manus AI's knowledge recall feature.
 */

export interface KnowledgeEntry {
  id: string;
  name: string;
  content: string;
  useWhen: string;
  category: KnowledgeCategory;
  createdAt: string;
  updatedAt: string;
  recallCount: number;
  lastRecalledAt?: string;
  tags: string[];
  isActive: boolean;
}

export type KnowledgeCategory =
  | 'preference'
  | 'instruction'
  | 'context'
  | 'fact'
  | 'pattern'
  | 'custom';

export interface KnowledgeRecallEvent {
  id: string;
  entryId: string;
  sessionId: string;
  recalledAt: string;
  context: string;
  wasUseful?: boolean;
}

export interface KnowledgeStore {
  entries: KnowledgeEntry[];
  addEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'recallCount'>): KnowledgeEntry;
  updateEntry(id: string, updates: Partial<KnowledgeEntry>): KnowledgeEntry | null;
  deleteEntry(id: string): boolean;
  searchEntries(query: string): KnowledgeEntry[];
  recallKnowledge(context: string, category?: KnowledgeCategory): KnowledgeEntry[];
  getEntryById(id: string): KnowledgeEntry | null;
  getEntriesByCategory(category: KnowledgeCategory): KnowledgeEntry[];
}

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  preference: 'Preference',
  instruction: 'Instruction',
  context: 'Context',
  fact: 'Fact',
  pattern: 'Pattern',
  custom: 'Custom',
};

export const KNOWLEDGE_CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  preference: 'bg-blue-500/20 text-blue-400',
  instruction: 'bg-green-500/20 text-green-400',
  context: 'bg-purple-500/20 text-purple-400',
  fact: 'bg-orange-500/20 text-orange-400',
  pattern: 'bg-cyan-500/20 text-cyan-400',
  custom: 'bg-gray-500/20 text-gray-400',
};
