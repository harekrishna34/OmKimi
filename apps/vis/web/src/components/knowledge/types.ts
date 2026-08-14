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

// Manus AI style colors - dark theme with subtle backgrounds
export const KNOWLEDGE_CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  preference: 'bg-[#1f6feb]/20 text-[#58a6ff]',
  instruction: 'bg-[#238636]/20 text-[#3fb950]',
  context: 'bg-[#8957e5]/20 text-[#bc8cff]',
  fact: 'bg-[#d29922]/20 text-[#e3b341]',
  pattern: 'bg-[#388bfd]/20 text-[#79c0ff]',
  custom: 'bg-[#484f58]/20 text-[#8b949e]',
};
