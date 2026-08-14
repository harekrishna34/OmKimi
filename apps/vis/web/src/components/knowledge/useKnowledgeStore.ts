import { useCallback, useState } from 'react';
import type { KnowledgeCategory, KnowledgeEntry, KnowledgeRecallEvent } from './types';

/**
 * Knowledge Store Hook
 * Manages knowledge entries with add, update, delete, search, and recall functionality.
 */
export function useKnowledgeStore(initialEntries: KnowledgeEntry[] = []) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [recallEvents, setRecallEvents] = useState<KnowledgeRecallEvent[]>([]);

  const addEntry = useCallback((
    newEntry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'recallCount' | 'isActive'>
  ): KnowledgeEntry => {
    const entry: KnowledgeEntry = {
      ...newEntry,
      id: `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recallCount: 0,
      isActive: true,
    };
    setEntries(prev => [...prev, entry]);
    return entry;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<KnowledgeEntry>): KnowledgeEntry | null => {
    let updated: KnowledgeEntry | null = null;
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        updated = { ...entry, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return entry;
    }));
    return updated;
  }, []);

  const deleteEntry = useCallback((id: string): boolean => {
    let deleted = false;
    setEntries(prev => {
      const index = prev.findIndex(e => e.id === id);
      if (index !== -1) {
        deleted = true;
        return prev.filter(e => e.id !== id);
      }
      return prev;
    });
    return deleted;
  }, []);

  const searchEntries = useCallback((query: string): KnowledgeEntry[] => {
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry =>
      entry.isActive && (
        entry.name.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.useWhen.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  }, [entries]);

  const recallKnowledge = useCallback((context: string, category?: KnowledgeCategory): KnowledgeEntry[] => {
    const lowerContext = context.toLowerCase();
    const recalled = entries.filter(entry => {
      if (!entry.isActive) return false;
      if (category && entry.category !== category) return false;

      // Match based on useWhen, tags, or content
      return (
        entry.useWhen.toLowerCase().includes(lowerContext) ||
        entry.tags.some(tag => lowerContext.includes(tag.toLowerCase())) ||
        entry.content.toLowerCase().includes(lowerContext)
      );
    });

    // Update recall counts
    if (recalled.length > 0) {
      setEntries(prev => prev.map(entry => {
        if (recalled.some(r => r.id === entry.id)) {
          return {
            ...entry,
            recallCount: entry.recallCount + 1,
            lastRecalledAt: new Date().toISOString(),
          };
        }
        return entry;
      }));

      // Log recall events
      const events: KnowledgeRecallEvent[] = recalled.map(entry => ({
        id: `re-${Date.now()}-${entry.id}`,
        entryId: entry.id,
        sessionId: 'current',
        recalledAt: new Date().toISOString(),
        context,
      }));
      setRecallEvents(prev => [...prev, ...events]);
    }

    return recalled;
  }, [entries]);

  const getEntryById = useCallback((id: string): KnowledgeEntry | null => {
    return entries.find(e => e.id === id) ?? null;
  }, [entries]);

  const getEntriesByCategory = useCallback((category: KnowledgeCategory): KnowledgeEntry[] => {
    return entries.filter(e => e.category === category && e.isActive);
  }, [entries]);

  return {
    entries,
    recallEvents,
    addEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    recallKnowledge,
    getEntryById,
    getEntriesByCategory,
  };
}
