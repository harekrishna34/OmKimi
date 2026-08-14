import { useState } from 'react';
import type { KnowledgeEntry } from './types';
import { KNOWLEDGE_CATEGORY_LABELS, KNOWLEDGE_CATEGORY_COLORS } from './types';

interface KnowledgeRecalledProps {
  entries: KnowledgeEntry[];
  context?: string;
}

export function KnowledgeRecalled({ entries, context }: KnowledgeRecalledProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="my-2 rounded border border-[var(--color-cat-conversation)]/30 bg-[var(--color-cat-conversation)]/10 px-3 py-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="text-[var(--color-cat-conversation)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <span className="font-mono text-[12px] text-[var(--color-cat-conversation)]">
          Knowledge recalled ({entries.length})
        </span>
        <svg
          className={`ml-auto h-4 w-4 text-fg-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 border-t border-[var(--color-cat-conversation)]/20 pt-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded bg-surface-0/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-fg-0">{entry.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${KNOWLEDGE_CATEGORY_COLORS[entry.category]}`}>
                  {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-fg-2 line-clamp-2">
                {entry.content}
              </div>
              {entry.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
