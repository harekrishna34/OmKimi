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
    <div className="my-3 rounded-lg border border-[#238636]/30 bg-[#238636]/10 px-4 py-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238636]/20">
          <svg className="h-3.5 w-3.5 text-[#3fb950]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-[13px] font-medium text-[#3fb950]">
          Knowledge recalled ({entries.length})
        </span>
        <svg
          className={`ml-auto h-4 w-4 text-[#3fb950]/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t border-[#238636]/20 pt-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-md bg-[#0d1117]/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#e6edf3]">{entry.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${KNOWLEDGE_CATEGORY_COLORS[entry.category]}`}>
                  {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#8b949e] line-clamp-2">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#8b949e]"
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
