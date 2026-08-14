import { useState } from 'react';
import type { KnowledgeCategory, KnowledgeEntry } from './types';
import { KNOWLEDGE_CATEGORY_LABELS, KNOWLEDGE_CATEGORY_COLORS } from './types';
import { EditKnowledgeDialog } from './EditKnowledgeDialog';
import { useKnowledgeStore } from './useKnowledgeStore';

interface KnowledgePanelProps {
  sessionId: string;
}

// Sample knowledge entries for demo
const SAMPLE_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'k-1',
    name: 'Language preference',
    content: 'User prefers Hindi for communication. Always respond in Hindi unless explicitly asked for English.',
    useWhen: 'When user sends messages in Hindi or asks about language',
    category: 'preference',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recallCount: 5,
    tags: ['hindi', 'language', 'preference'],
    isActive: true,
  },
  {
    id: 'k-2',
    name: 'Direct download links preference',
    content: 'Always provide direct download links for all domains.',
    useWhen: 'Whenever providing files or domains to download',
    category: 'instruction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recallCount: 3,
    tags: ['download', 'links', 'preference'],
    isActive: true,
  },
];

export function KnowledgePanel({ sessionId }: KnowledgePanelProps) {
  const store = useKnowledgeStore(SAMPLE_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const filteredEntries = store.entries.filter((entry) => {
    if (!entry.isActive) return false;
    if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.name.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleCreate = () => {
    setEditingEntry(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleSave = (data: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'recallCount' | 'isActive'>) => {
    if (dialogMode === 'create') {
      store.addEntry(data);
    } else if (editingEntry) {
      store.updateEntry(editingEntry.id, data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this knowledge entry?')) {
      store.deleteEntry(id);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface-1 px-3 py-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge..."
          className="flex-1 border border-border bg-surface-0 px-3 py-1.5 font-mono text-[12px] text-fg-0 placeholder-fg-3 focus:border-border-strong focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as KnowledgeCategory | 'all')}
          className="border border-border bg-surface-0 px-2 py-1.5 font-mono text-[12px] text-fg-0 focus:border-border-strong focus:outline-none"
        >
          <option value="all">All Categories</option>
          {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {KNOWLEDGE_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          className="rounded bg-[var(--color-cat-conversation)] px-3 py-1.5 font-mono text-[12px] text-white hover:opacity-90"
        >
          + New
        </button>
      </div>

      {/* Knowledge List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredEntries.length === 0 ? (
          <div className="py-8 text-center font-mono text-[12px] text-fg-3">
            {searchQuery ? 'No matching knowledge entries' : 'No knowledge entries yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="group rounded border border-border bg-surface-1 p-3 transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-fg-0">{entry.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${KNOWLEDGE_CATEGORY_COLORS[entry.category]}`}>
                        {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-fg-2 line-clamp-2">
                      {entry.content}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-fg-3">
                      Use when: {entry.useWhen}
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-mono text-fg-3"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-fg-3">
                      <span>Recalled {entry.recallCount} times</span>
                      {entry.lastRecalledAt && (
                        <span>Last: {new Date(entry.lastRecalledAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-fg-3 hover:text-fg-1"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-fg-3 hover:text-red-400"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="shrink-0 border-t border-border bg-surface-1 px-3 py-2 font-mono text-[10px] text-fg-3">
        {store.entries.length} entries · {store.entries.filter(e => e.isActive).length} active
      </div>

      {/* Edit Dialog */}
      <EditKnowledgeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        entry={editingEntry}
        mode={dialogMode}
      />
    </div>
  );
}
