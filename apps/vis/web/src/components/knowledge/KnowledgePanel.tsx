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
    <div className="flex min-h-0 flex-1 flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="shrink-0 border-b border-[#21262d] bg-[#161b22] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-medium text-[#e6edf3]">Knowledge Base</h2>
            <p className="mt-1 text-[13px] text-[#8b949e]">
              {store.entries.length} entries · {store.entries.filter(e => e.isActive).length} active
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#2ea043]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Knowledge
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="shrink-0 border-b border-[#21262d] bg-[#161b22] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge..."
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] py-2 pl-10 pr-4 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as KnowledgeCategory | 'all')}
            className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-[13px] text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {KNOWLEDGE_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Knowledge List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="h-12 w-12 text-[#30363d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-4 text-[14px] text-[#8b949e]">
              {searchQuery ? 'No matching knowledge entries' : 'No knowledge entries yet'}
            </p>
            <p className="mt-2 text-[13px] text-[#484f58]">
              Create your first knowledge entry to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="group rounded-lg border border-[#21262d] bg-[#161b22] p-4 transition-all hover:border-[#30363d] hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[14px] font-medium text-[#e6edf3]">{entry.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${KNOWLEDGE_CATEGORY_COLORS[entry.category]}`}>
                        {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#8b949e] line-clamp-2">
                      {entry.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#484f58]">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Recalled {entry.recallCount} times
                      </div>
                      {entry.lastRecalledAt && (
                        <div className="flex items-center gap-1.5 text-[12px] text-[#484f58]">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last: {new Date(entry.lastRecalledAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-[#0d1117] px-2 py-0.5 text-[11px] text-[#8b949e]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-[12px] text-[#484f58]">
                      Use when: {entry.useWhen}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="rounded-md p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-md p-2 text-[#8b949e] hover:bg-[#da3633]/20 hover:text-[#f85149]"
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
