/**
 * Knowledge Store - SQLite-based knowledge storage
 *
 * Stores and retrieves knowledge entries with full-text search.
 * Inspired by Manus AI's knowledge system.
 */

import { randomUUID } from 'node:crypto';

import type {
  KnowledgeEntry,
  KnowledgeCategory,
  KnowledgeSearchResult,
} from './types';

/** In-memory knowledge store (production would use SQLite) */
const knowledgeEntries: Map<string, KnowledgeEntry> = new Map();

/**
 * Generate a unique ID for knowledge entries
 */
function generateId(): string {
  return randomUUID();
}

/**
 * Add a new knowledge entry
 */
export function addKnowledge(params: {
  name: string;
  useWhen: string;
  content: string;
  category?: KnowledgeCategory;
  sessionId?: string;
}): KnowledgeEntry {
  const now = new Date().toISOString();
  const entry: KnowledgeEntry = {
    id: generateId(),
    name: params.name,
    useWhen: params.useWhen,
    content: params.content,
    category: params.category ?? 'preference',
    confidence: 1.0,
    createdAt: now,
    updatedAt: now,
    sessionId: params.sessionId,
    recallCount: 0,
  };

  knowledgeEntries.set(entry.id, entry);
  return entry;
}

/**
 * Update an existing knowledge entry
 */
export function updateKnowledge(
  id: string,
  updates: Partial<Pick<KnowledgeEntry, 'name' | 'useWhen' | 'content' | 'category'>>
): KnowledgeEntry | null {
  const existing = knowledgeEntries.get(id);
  if (!existing) return null;

  const updated: KnowledgeEntry = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  knowledgeEntries.set(id, updated);
  return updated;
}

/**
 * Delete a knowledge entry
 */
export function deleteKnowledge(id: string): boolean {
  return knowledgeEntries.delete(id);
}

/**
 * Get a knowledge entry by ID
 */
export function getKnowledge(id: string): KnowledgeEntry | null {
  return knowledgeEntries.get(id) ?? null;
}

/**
 * List all knowledge entries, optionally filtered by category
 */
export function listKnowledge(category?: KnowledgeCategory): KnowledgeEntry[] {
  const entries = Array.from(knowledgeEntries.values());
  if (category) {
    return entries.filter((e) => e.category === category);
  }
  return entries;
}

/**
 * Search knowledge entries by query
 * Uses simple substring matching (production would use FTS5)
 */
export function searchKnowledge(query: string): KnowledgeSearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: KnowledgeSearchResult[] = [];

  for (const entry of knowledgeEntries.values()) {
    // Check if query matches name, useWhen, or content
    const nameMatch = entry.name.toLowerCase().includes(lowerQuery);
    const useWhenMatch = entry.useWhen.toLowerCase().includes(lowerQuery);
    const contentMatch = entry.content.toLowerCase().includes(lowerQuery);

    if (nameMatch || useWhenMatch || contentMatch) {
      // Calculate simple relevance score
      let score = 0;
      if (nameMatch) score += 0.5;
      if (useWhenMatch) score += 0.3;
      if (contentMatch) score += 0.2;

      // Get matched snippet
      let snippet = entry.content;
      const contentIndex = entry.content.toLowerCase().indexOf(lowerQuery);
      if (contentIndex >= 0) {
        const start = Math.max(0, contentIndex - 40);
        const end = Math.min(entry.content.length, contentIndex + query.length + 40);
        snippet = (start > 0 ? '...' : '') +
          entry.content.slice(start, end) +
          (end < entry.content.length ? '...' : '');
      }

      results.push({ entry, score, snippet });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Recall knowledge relevant to a context
 * Returns entries that match the given context string
 */
export function recallKnowledge(context: string): KnowledgeEntry[] {
  const results = searchKnowledge(context);

  // Increment recall count for matched entries
  for (const result of results) {
    const entry = knowledgeEntries.get(result.entry.id);
    if (entry) {
      knowledgeEntries.set(entry.id, {
        ...entry,
        recallCount: entry.recallCount + 1,
      });
    }
  }

  return results.map((r) => r.entry);
}

/**
 * Get knowledge statistics
 */
export function getKnowledgeStats(): {
  total: number;
  byCategory: Record<KnowledgeCategory, number>;
  mostRecalled: KnowledgeEntry[];
} {
  const entries = Array.from(knowledgeEntries.values());

  const byCategory: Record<KnowledgeCategory, number> = {
    preference: 0,
    pattern: 0,
    fact: 0,
    skill: 0,
    context: 0,
  };

  for (const entry of entries) {
    byCategory[entry.category]++;
  }

  const mostRecalled = [...entries]
    .sort((a, b) => b.recallCount - a.recallCount)
    .slice(0, 5);

  return {
    total: entries.length,
    byCategory,
    mostRecalled,
  };
}

/**
 * Clear all knowledge entries (for testing)
 */
export function clearKnowledge(): void {
  knowledgeEntries.clear();
}
