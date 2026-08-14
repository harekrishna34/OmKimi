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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[#21262d] bg-[#161b22] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] px-6 py-4">
          <h2 className="text-[16px] font-medium text-[#e6edf3]">
            {mode === 'create' ? 'Create Knowledge' : 'Edit Knowledge'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#e6edf3]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Language preference"
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-[14px] text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
            />
          </div>

          {/* Use When */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#e6edf3]">Use when</label>
            <input
              type="text"
              value={useWhen}
              onChange={(e) => setUseWhen(e.target.value)}
              placeholder="e.g., When user asks about language"
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-[14px] text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#e6edf3]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-[14px] text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
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
            <label className="mb-2 block text-[13px] font-medium text-[#e6edf3]">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter knowledge content..."
              rows={4}
              className="w-full resize-none rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-[14px] text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
            />
            <div className="mt-2 text-right text-[12px] text-[#484f58]">
              {content.length} / 2000
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#e6edf3]">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., language, preference, hindi"
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-[14px] text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#21262d] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-[#8b949e] hover:text-[#e6edf3]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="rounded-md bg-[#238636] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
