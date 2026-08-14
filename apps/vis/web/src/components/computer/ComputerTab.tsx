/**
 * ComputerTab — Manus-style "Computer" view for the vis app.
 *
 * Shows tool calls as activity cards with:
 * - Header: "OmKimi's computer" with current status
 * - Steps: Each tool call as a card with icon, name, duration, status
 * - Results: Parsed output (web search results as cards, etc.)
 * - Timeline: Step-by-step progress indicator
 */

import { useEffect, useMemo, useState } from 'react';

import { useSession } from '../../hooks/useSession';
import { useWire } from '../../hooks/useWire';
import type { WireEntry } from '../../types';
import { formatDuration } from '../../util/time';

interface ToolActivity {
  readonly toolCallId: string;
  readonly name: string;
  readonly args: unknown;
  readonly callTime: number | null;
  readonly resultTime: number | null;
  readonly durationMs: number | null;
  readonly output: string | null;
  readonly isError: boolean;
  readonly stepUuid: string;
}

interface MutableToolActivity {
  toolCallId: string;
  name: string;
  args: unknown;
  callTime: number | null;
  resultTime: number | null;
  durationMs: number | null;
  output: string | null;
  isError: boolean;
  stepUuid: string;
}

interface SearchResult {
  readonly title: string;
  readonly url: string;
  readonly site: string | undefined;
  readonly snippet: string;
}

interface ComputerTabProps {
  sessionId: string;
}

export function ComputerTab({ sessionId }: ComputerTabProps) {
  const { data: detail } = useSession(sessionId);
  const [agentId, setAgentId] = useState('main');

  useEffect(() => {
    setAgentId('main');
  }, [sessionId]);

  const { data: wire, isLoading, error } = useWire(sessionId, agentId);

  const activities = useMemo<ToolActivity[]>(() => {
    if (!wire) return [];

    const entries = wire.records as WireEntry[];
    const callMap = new Map<string, MutableToolActivity>();

    for (const entry of entries) {
      if (entry.data.type !== 'context.append_loop_event') continue;
      const ev = entry.data.event;
      const time = entry.data.time ?? null;

      if (ev.type === 'tool.call') {
        callMap.set(ev.toolCallId, {
          toolCallId: ev.toolCallId,
          name: ev.name,
          args: ev.args,
          callTime: time,
          resultTime: null,
          durationMs: null,
          output: null,
          isError: false,
          stepUuid: ev.stepUuid,
        });
      } else if (ev.type === 'tool.result') {
        const existing = callMap.get(ev.toolCallId);
        if (existing) {
          existing.resultTime = time;
          existing.durationMs = time !== null && existing.callTime !== null
            ? time - existing.callTime
            : null;
          existing.output = typeof ev.result.output === 'string'
            ? ev.result.output
            : JSON.stringify(ev.result.output);
          existing.isError = ev.result.isError ?? false;
        }
      }
    }

    return Array.from(callMap.values())
      .sort((a, b) => (a.callTime ?? 0) - (b.callTime ?? 0));
  }, [wire]);

  const currentActivity: ToolActivity | null = activities.length > 0 ? activities[activities.length - 1]! : null;
  const agents = detail?.agents ?? [];
  const agentsList = detail?.agents ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface-1 px-3 py-2">
        <label className="flex items-center gap-2 font-mono text-[11px] text-fg-2">
          <span className="text-fg-3">agent</span>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="border border-border bg-surface-0 px-2 py-1 font-mono text-[12px] text-fg-0 focus:border-border-strong focus:outline-none"
          >
            {agentsList.length === 0 ? <option value={agentId}>{agentId}</option> : null}
            {agentsList.map((a) => (
              <option key={a.agentId} value={a.agentId}>
                {a.agentId} ({a.type})
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto font-mono text-[11px] text-fg-3">
          {activities.length} tool call{activities.length === 1 ? '' : 's'}
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 font-mono text-[12px] text-fg-3">loading activity…</div>
      ) : error ? (
        <div className="p-6 font-mono text-[12px] text-[var(--color-sev-error)]">{error.message}</div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Computer Header */}
          <ComputerHeader
            agentId={agentId}
            currentActivity={currentActivity}
            totalSteps={activities.length}
          />

          {/* Activity Cards */}
          <div className="p-4">
            {activities.length === 0 ? (
              <div className="text-center font-mono text-[12px] text-fg-3 py-8">
                No tool calls yet. Agent is idle.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activities.map((activity, index) => (
                  <ActivityCard
                    key={activity.toolCallId}
                    activity={activity}
                    stepNumber={index + 1}
                    totalSteps={activities.length}
                    isLatest={index === activities.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Computer Header ─────────── */

function ComputerHeader({
  agentId,
  currentActivity,
  totalSteps,
}: {
  agentId: string;
  currentActivity: ToolActivity | null;
  totalSteps: number;
}) {
  const statusText = currentActivity
    ? `Using ${currentActivity.name}`
    : 'Idle';

  return (
    <div className="border-b border-border bg-surface-1 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Monitor icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-0">
          <MonitorIcon />
        </div>

        {/* Title + Status */}
        <div className="flex flex-col">
          <span className="font-mono text-[13px] font-medium text-fg-0">
            OmKimi's computer
          </span>
          <span className="font-mono text-[11px] text-fg-3">
            {statusText}
            {currentActivity ? ' …' : ''}
          </span>
        </div>

        {/* Step counter */}
        <div className="ml-auto flex items-center gap-2">
          {totalSteps > 0 ? (
            <span className="font-mono text-[11px] text-fg-3">
              Step {totalSteps}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Activity Card ─────────── */

function ActivityCard({
  activity,
  stepNumber,
  totalSteps,
  isLatest,
}: {
  activity: ToolActivity;
  stepNumber: number;
  totalSteps: number;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

  const searchResults = useMemo(() => {
    if (activity.name !== 'WebSearch' || !activity.output) return [];
    return parseSearchResults(activity.output);
  }, [activity]);

  const toolIcon = getToolIcon(activity.name);

  return (
    <div
      className={`border bg-surface-0 ${
        activity.isError
          ? 'border-[var(--color-sev-error)]'
          : isLatest
            ? 'border-[var(--color-cat-conversation)]'
            : 'border-border'
      }`}
    >
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-1"
      >
        {/* Step indicator */}
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-mono ${
            activity.isError
              ? 'bg-[var(--color-sev-error)] text-white'
              : 'bg-[var(--color-cat-conversation)] text-white'
          }`}
        >
          {stepNumber}
        </div>

        {/* Icon */}
        <span className="text-[14px]">{toolIcon}</span>

        {/* Name + Duration */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-mono text-[12px] text-fg-0 truncate">
            {activity.name}
          </span>
          {activity.durationMs !== null ? (
            <span className="font-mono text-[10px] text-fg-3 tabular">
              {formatDuration(activity.durationMs)}
            </span>
          ) : null}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {activity.isError ? (
            <span className="font-mono text-[10px] text-[var(--color-sev-error)]">
              Error
            </span>
          ) : null}
          {isLatest && !activity.resultTime ? (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--color-cat-conversation)] animate-pulse" />
              <span className="font-mono text-[10px] text-fg-3">Running</span>
            </span>
          ) : null}
        </div>

        {/* Expand indicator */}
        <span className="text-fg-3 text-[10px]">
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {/* Card Body */}
      {expanded ? (
        <div className="border-t border-border px-3 py-2">
          {/* Web Search Results */}
          {activity.name === 'WebSearch' && searchResults.length > 0 ? (
            <SearchResultsList results={searchResults} />
          ) : activity.output ? (
            <ToolOutput output={activity.output} isError={activity.isError} />
          ) : (
            <div className="font-mono text-[11px] text-fg-3 py-2">
              No output yet…
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────── Search Results (Manus-style) ─────────── */

function SearchResultsList({ results }: { results: SearchResult[] }) {
  return (
    <div className="flex flex-col">
      {results.map((result, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 py-2 border-b border-border last:border-b-0"
        >
          <div className="flex items-start gap-2">
            {/* Favicon */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-1 mt-0.5">
              <FaviconLetter url={result.url} />
            </div>

            {/* Title + Snippet */}
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[12px] font-medium text-fg-0 leading-tight">
                {result.title}
              </span>
              {result.site ? (
                <span className="font-mono text-[10px] text-fg-3">
                  {result.site}
                </span>
              ) : null}
              {result.snippet ? (
                <span className="font-mono text-[11px] text-fg-2 leading-relaxed mt-0.5">
                  {truncate(result.snippet, 150)}
                </span>
              ) : null}
            </div>
          </div>

          {/* URL */}
          <div className="pl-7">
            <span className="font-mono text-[10px] text-fg-3 truncate block">
              {result.url}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaviconLetter({ url }: { url: string }) {
  let letter = '?';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    letter = host.charAt(0).toUpperCase();
  } catch {
    letter = url.charAt(0).toUpperCase();
  }

  return (
    <span className="font-mono text-[9px] text-fg-2 font-medium">
      {letter}
    </span>
  );
}

/* ─────────── Generic Tool Output ─────────── */

function ToolOutput({ output, isError }: { output: string; isError: boolean }) {
  const truncated = output.length > 500 ? output.slice(0, 500) + '…' : output;

  return (
    <pre
      className={`whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
        isError ? 'text-[var(--color-sev-error)]' : 'text-fg-1'
      }`}
    >
      {truncated}
    </pre>
  );
}

/* ─────────── Helpers ─────────── */

function getToolIcon(name: string): string {
  const icons: Record<string, string> = {
    WebSearch: '🔍',
    Bash: '⌨️',
    Read: '📖',
    Write: '✏️',
    Edit: '📝',
    Glob: '📁',
    Grep: '🔎',
    FetchURL: '🌐',
    AskUserQuestion: '❓',
    Agent: '🤖',
    WebFetch: '🌐',
  };
  return icons[name] ?? '🔧';
}

function parseSearchResults(output: string): SearchResult[] {
  const results: SearchResult[] = [];
  const blocks = output.split(/^---+$/m);

  for (const block of blocks) {
    const fields: Record<string, string> = {};
    for (const line of block.split('\n')) {
      const match = /^(Title|Site|Date|URL|Snippet):\s*(.*)$/.exec(line);
      if (match !== null) {
        const [, key, value] = match;
        if (key !== undefined && value !== undefined) fields[key] = value.trim();
      }
    }

    const title = fields['Title'];
    const url = fields['URL'];
    if (title && url) {
      results.push({
        title,
        url,
        site: fields['Site'],
        snippet: fields['Snippet'] ?? '',
      });
    }
  }

  return results;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="9" rx="1" />
      <line x1="5" y1="14" x2="11" y2="14" />
      <line x1="8" y1="11" x2="8" y2="14" />
    </svg>
  );
}
