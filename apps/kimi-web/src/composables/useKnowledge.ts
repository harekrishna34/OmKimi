// apps/kimi-web/src/composables/useKnowledge.ts
import { ref, computed } from 'vue';
import type { Knowledge, KnowledgeFormData, KnowledgeRecallEvent, KnowledgeState } from '../types';
import { getKimiWebApi } from '../api';

// Global state (singleton across app)
const state = ref<KnowledgeState>({
  entries: [],
  recalls: [],
});

// Workspace bound for server sync — set by the app shell when the active
// workspace changes. While bound, mutations mirror to the daemon's workspace
// knowledge store (which the agent reads for its system prompt) and new
// agent-written entries are pulled on bind.
const boundWorkspaceId = ref<string | null>(null);

/**
 * Composable for managing the Knowledge System.
 * 
 * Provides:
 * - CRUD operations for knowledge entries
 * - Knowledge recall events for conversations
 * - localStorage persistence + optional server sync per workspace
 * - Adaptive auto-learning from user messages
 */
export function useKnowledge() {
  // Load from localStorage on init
  const STORAGE_KEY = 'omkimi-knowledge';

  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as KnowledgeState;
        state.value.entries = parsed.entries || [];
        state.value.recalls = parsed.recalls || [];
      }
    } catch (e) {
      console.warn('Failed to load knowledge from storage:', e);
    }
  }

  function saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch (e) {
      console.warn('Failed to save knowledge to storage:', e);
    }
  }

  // Initialize on first use
  loadFromStorage();

  // ---- Server sync ---------------------------------------------------------

  function toKnowledgeInput(entry: Knowledge): {
    name: string;
    useWhen: string;
    content: string;
    tags?: string[];
    active?: boolean;
  } {
    return {
      name: entry.name,
      useWhen: entry.useWhen,
      content: entry.content,
      tags: entry.tags,
      active: entry.active,
    };
  }

  function reconcileId(oldId: string, newId: string): void {
    const index = state.value.entries.findIndex((e) => e.id === oldId);
    if (index === -1) return;
    state.value.entries[index] = { ...state.value.entries[index]!, id: newId };
    saveToStorage();
  }

  /** Fire-and-forget mirror of a local create to the bound workspace store. */
  function pushCreate(entry: Knowledge): void {
    const wid = boundWorkspaceId.value;
    if (wid === null) return;
    getKimiWebApi()
      .createKnowledge(wid, toKnowledgeInput(entry))
      .then((remote) => {
        if (remote.id !== entry.id) reconcileId(entry.id, remote.id);
      })
      .catch(() => {/* server unreachable — local cache stays authoritative */});
  }

  /** Fire-and-forget mirror of a local update to the bound workspace store. */
  function pushUpdate(entry: Knowledge): void {
    const wid = boundWorkspaceId.value;
    if (wid === null) return;
    getKimiWebApi()
      .updateKnowledge(wid, entry.id, toKnowledgeInput(entry))
      .catch(() => {/* server unreachable — local cache stays authoritative */});
  }

  /** Fire-and-forget mirror of a local delete to the bound workspace store. */
  function pushDelete(id: string): void {
    const wid = boundWorkspaceId.value;
    if (wid === null) return;
    getKimiWebApi()
      .deleteKnowledge(wid, id)
      .catch(() => {/* server unreachable — local cache stays authoritative */});
  }

  /**
   * Bind the knowledge store to a workspace: pull the daemon's entries
   * (agent-written ones included) into the local cache — server wins for
   * matching ids — and push local-only entries up so both sides converge.
   * Pass null to unbind (local cache keeps working on its own).
   */
  async function bindWorkspace(workspaceId: string | null): Promise<void> {
    boundWorkspaceId.value = workspaceId;
    if (workspaceId === null) return;
    try {
      const remote = await getKimiWebApi().listKnowledge(workspaceId);
      const remoteIds = new Set(remote.map((r) => r.id));
      const local = state.value.entries;
      const localOnly = local.filter((e) => !remoteIds.has(e.id));
      state.value.entries = [
        ...remote.map((r) => ({
          id: r.id,
          name: r.name,
          useWhen: r.useWhen,
          content: r.content,
          tags: r.tags,
          active: r.active,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        ...localOnly,
      ];
      saveToStorage();
      for (const entry of localOnly) pushCreate(entry);
    } catch {
      // Server unreachable — keep the local cache as-is.
    }
  }

  // ---- Computed ----

  /** All active knowledge entries */
  const activeEntries = computed(() => 
    state.value.entries.filter(e => e.active)
  );

  /** All knowledge entries (including inactive) */
  const allEntries = computed(() => state.value.entries);

  /** Total count of active entries */
  const activeCount = computed(() => activeEntries.value.length);

  // ---- Actions ----

  /** Create a new knowledge entry */
  function createKnowledge(data: KnowledgeFormData): Knowledge {
    const now = new Date().toISOString();
    const knowledge: Knowledge = {
      id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.name.trim(),
      useWhen: data.useWhen.trim(),
      content: data.content.trim(),
      tags: data.tags,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    state.value.entries.push(knowledge);
    saveToStorage();
    pushCreate(knowledge);
    return knowledge;
  }

  /** Update an existing knowledge entry */
  function updateKnowledge(id: string, data: KnowledgeFormData): Knowledge | null {
    const index = state.value.entries.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    const existing = state.value.entries[index]!;
    const updated: Knowledge = {
      ...existing,
      name: data.name.trim(),
      useWhen: data.useWhen.trim(),
      content: data.content.trim(),
      tags: data.tags,
      updatedAt: new Date().toISOString(),
    };
    state.value.entries[index] = updated;
    saveToStorage();
    pushUpdate(updated);
    return updated;
  }

  /** Delete a knowledge entry */
  function deleteKnowledge(id: string): boolean {
    const index = state.value.entries.findIndex(e => e.id === id);
    if (index === -1) return false;
    state.value.entries.splice(index, 1);
    saveToStorage();
    pushDelete(id);
    return true;
  }

  /** Toggle active state of a knowledge entry */
  function toggleKnowledge(id: string): Knowledge | null {
    const entry = state.value.entries.find(e => e.id === id);
    if (!entry) return null;
    entry.active = !entry.active;
    entry.updatedAt = new Date().toISOString();
    saveToStorage();
    pushUpdate(entry);
    return entry;
  }

  /** Get a knowledge entry by ID */
  function getKnowledge(id: string): Knowledge | undefined {
    return state.value.entries.find(e => e.id === id);
  }

  /** Search knowledge entries by query */
  function searchKnowledge(query: string): Knowledge[] {
    const q = query.toLowerCase();
    return activeEntries.value.filter(e => 
      e.name.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.useWhen.toLowerCase().includes(q)
    );
  }

  /** Find knowledge entries that match a given context */
  function findRelevantKnowledge(context: string): Knowledge[] {
    const ctx = context.toLowerCase();
    return activeEntries.value.filter(e => {
      const useWhen = e.useWhen.toLowerCase();
      // Simple relevance matching
      return useWhen.includes('always') || 
             useWhen.includes('every') ||
             useWhen.includes('whenever') ||
             ctx.includes(useWhen);
    });
  }

  // ---- Adaptive auto-learning ---------------------------------------------
  // The agent learns small durable preferences from user messages and saves
  // them as knowledge entries — the same way language adaptation works today
  // but explicit, visible, and editable in Settings → Knowledge.

  /** Common Hindi/Hinglish word markers (case-insensitive word matches). */
  const HINGLISH_MARKERS = [
    'hai', 'hain', 'haan', 'ji', 'ka', 'ki', 'ke', 'ko', 'kya', 'kyu', 'nahi', 'nahin',
    'bhai', 'bhaiya', 'yaar', 'matlab', 'karna', 'karne', 'karo', 'hoga', 'hogi',
    'raha', 'rahi', 'wala', 'wale', 'mujhe', 'tumhe', 'tumhara', 'hamara', 'aap', 'hum',
    'acha', 'theek', 'thik', 'dikha', 'batao', 'chahiye', 'karenge', 'kyunki',
    'agar', 'jab', 'toh', 'bhi', 'mein', 'par', 'aur', 'usko', 'isko',
    'mere', 'mera', 'tera', 'apna', 'ho', 'hota', 'hoti', 'tha', 'thi',
    'sab', 'bahut', 'kaam', 'kar', 'de', 'do', 'lo', 'le', 'se', 'pe',
    'sun', 'suno', 'dekho', 'lagta', 'samajh', 'samjho', 'pata', 'bolo',
    'banao', 'kijiye', 'dijiye', 'padho', 'likho', 'chalo', 'kuch', 'kuchh',
    'sahi', 'galat', 'wahi', 'tum', 'rahe', 'honge',
  ];

  /** Detect Hinglish: ≥2 distinct Hindi word markers in the message. */
  function isHinglish(text: string): boolean {
    const lower = text.toLowerCase();
    let hits = 0;
    for (const m of HINGLISH_MARKERS) {
      if (new RegExp(`\\b${m}\\b`, 'i').test(lower)) {
        hits += 1;
        if (hits >= 2) return true;
      }
    }
    return false;
  }

  /** Detect pure Hindi (Devanagari script). */
  function isHindi(text: string): boolean {
    return /[\u0900-\u097F]/.test(text);
  }

  function hasKnowledgeNamed(name: string): boolean {
    return state.value.entries.some(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    );
  }

  /**
   * Learn durable preferences from a user message. Detectors run once each —
   * an entry is only created when no entry with the same name exists yet.
   * Returns the entries created for this message (empty when nothing new).
   */
  function autoLearnFromPrompt(text: string): Knowledge[] {
    if (!text.trim()) return [];
    const created: Knowledge[] = [];

    // 1. Language preference — learned from how the user actually writes.
    if (!hasKnowledgeNamed('Language preference')) {
      let language: string | null = null;
      if (isHindi(text)) language = 'Hindi';
      else if (isHinglish(text)) language = 'Hinglish';
      else if (/^[\x00-\x7F]+$/.test(text)) language = 'English';
      if (language) {
        const entry = createKnowledge({
          name: 'Language preference',
          useWhen: 'Whenever communicating with the user',
          content: `Always use ${language} when communicating with the user.`,
          tags: ['auto-learned', 'language'],
        });
        created.push(entry);
      }
    }

    // 2. User name — learned from explicit self-introductions.
    if (!hasKnowledgeNamed('User name')) {
      const nameMatch = text.match(
        /(?:my name is|call me|mera naam|i am) ([A-Za-z\u0900-\u097F]+)/i,
      );
      if (nameMatch?.[1]) {
        const name = nameMatch[1];
        const entry = createKnowledge({
          name: 'User name',
          useWhen: 'Whenever addressing the user',
          content: `The user's name is ${name}. Address them by this name when appropriate.`,
          tags: ['auto-learned', 'user-name'],
        });
        created.push(entry);
      }
    }

    return created;
  }

  // ---- Recall Events ----

  /** Record a knowledge recall event */
  function recordRecall(items: Knowledge[]): KnowledgeRecallEvent {
    const event: KnowledgeRecallEvent = {
      id: `recall-${Date.now()}`,
      items,
      recalledAt: new Date().toISOString(),
    };
    state.value.recalls.push(event);
    return event;
  }

  /** Get recall events for a conversation */
  function getRecalls(): KnowledgeRecallEvent[] {
    return state.value.recalls;
  }

  /** Clear all recall events */
  function clearRecalls(): void {
    state.value.recalls = [];
  }

  /** Import knowledge from JSON */
  function importKnowledge(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.name && item.content) {
            createKnowledge({
              name: item.name,
              useWhen: item.useWhen || '',
              content: item.content,
              tags: item.tags || [],
            });
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import knowledge:', e);
      return false;
    }
  }

  /** Export all knowledge as JSON */
  function exportKnowledge(): string {
    return JSON.stringify(state.value.entries, null, 2);
  }

  return {
    // State
    state,
    activeEntries,
    allEntries,
    activeCount,

    // CRUD
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    toggleKnowledge,
    getKnowledge,
    searchKnowledge,
    findRelevantKnowledge,

    // Adaptive auto-learning
    autoLearnFromPrompt,

    // Server sync
    bindWorkspace,

    // Recalls
    recordRecall,
    getRecalls,
    clearRecalls,

    // Import/Export
    importKnowledge,
    exportKnowledge,
  };
}
