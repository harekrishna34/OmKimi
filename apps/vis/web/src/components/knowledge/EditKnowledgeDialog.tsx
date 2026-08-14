import { useEffect, useState } from 'react';
import type { KnowledgeCategory, KnowledgeEntry } from './types';
import { KNOWLEDGE_CATEGORY_LABELS } from './types';

interface EditKnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'recallCount' | 'isActive'>) => void;
  entry?: KnowledgeEntry | null;
  mode: 'create' | 'edit';
}

export function EditKnowledgeDialog({
  isOpen,
  onClose,
  onSave,
  entry,
  mode,
}: EditKnowledgeDialogProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [useWhen, setUseWhen] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('preference');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (entry && mode === 'edit') {
      setName(entry.name);
      setContent(entry.content);
      setUseWhen(entry.useWhen);
      setCategory(entry.category);
      setTags(entry.tags.join(', '));
    } else {
      setName('');
      setContent('');
      setUseWhen('');
      setCategory('preference');
      setTags('');
    }
  }, [entry, mode, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;

    onSave({
      name: name.trim(),
      content: content.trim(),
      useWhen: useWhen.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      lastRecalledAt: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface-1 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[14px] text-fg-0">
            {mode === 'create' ? 'Create Knowledge' : 'Edit Knowledge'}
          </h2>
          <button
            onClick={onClose}
            className="text-fg-3 hover:text-fg-1"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block font-mono text-[11px] text-fg-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Language preference"
              className="w-full border border-border bg-surface-0 px-3 py-2 font-mono text-[12px] text-fg-0 placeholder-fg-3 focus:border-border-strong focus:outline-none"
            />
          </div>

          {/* Use When */}
          <div>
            <label className="mb-1 block font-mono text-[11px] text-fg-2">Use when</label>
            <input
              type="text"
              value={useWhen}
              onChange={(e) => setUseWhen(e.target.value)}
              placeholder="e.g., When user asks about language"
              className="w-full border border-border bg-surface-0 px-3 py-2 font-mono text-[12px] text-fg-0 placeholder-fg-3 focus:border-border-strong focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block font-mono text-[11px] text-fg-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
              className="w-full border border-border bg-surface-0 px-3 py-2 font-mono text-[12px] text-fg-0 focus:border-border-strong focus:outline-none"
            >
              {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {KNOWLEDGE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="mb-1 block font-mono text-[11px] text-fg-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter knowledge content..."
              rows={4}
              className="w-full resize-none border border-border bg-surface-0 px-3 py-2 font-mono text-[12px] text-fg-0 placeholder-fg-3 focus:border-border-strong focus:outline-none"
            />
            <div className="mt-1 text-right font-mono text-[10px] text-fg-3">
              {content.length} / 2000
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block font-mono text-[11px] text-fg-2">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., language, preference, hindi"
              className="w-full border border-border bg-surface-0 px-3 py-2 font-mono text-[12px] text-fg-0 placeholder-fg-3 focus:border-border-strong focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-[12px] text-fg-2 hover:text-fg-0"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="rounded bg-[var(--color-cat-conversation)] px-4 py-2 font-mono text-[12px] text-white disabled:opacity-50"
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
