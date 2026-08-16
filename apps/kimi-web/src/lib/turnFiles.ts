// apps/kimi-web/src/lib/turnFiles.ts
// "Files changed this turn" computation — ported from the original bundle's
// `nbe`/`obe`/`C$` helpers. Walks a turn's tool calls, collects Edit/Write/
// MultiEdit operations, counts added/removed lines per normalized path and
// merges repeated edits to the same file (multi_edit offsets already applied
// by buildEditDiffLines).

import type { ChatTurn, DiffViewLine } from '../types';
import { buildEditDiffLines, extractEditPath } from './toolDiff';
import { normalizeToolName } from './toolMeta';

export interface TurnFileChange {
  /** Absolute path from the tool call input (verbatim). */
  path: string;
  added: number;
  removed: number;
  /** True when at least one change was a Write (no line diff available). */
  hasWrite: boolean;
  /** True when line counts could not be computed for at least one change. */
  statsIncomplete: boolean;
  /** Merged diff lines (null when a diff could not be built). */
  diff: DiffViewLine[] | null;
  /** Source tool call id (first tool that touched this path) — used to open
      the existing tool diff side panel. */
  toolId?: string;
}

const DIFF_KINDS = new Set(['edit', 'multi_edit', 'write']);

/** Count added/removed rows in a diff line list (hunk/context rows skip). */
function countAddedRemoved(diff: DiffViewLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const row of diff) {
    if (row.type === 'add') added++;
    else if (row.type === 'del') removed++;
  }
  return { added, removed };
}

/** Cross-platform path normalization — port of the original `obe`. */
export function normalizeTurnPath(path: string): string {
  const t = path.replace(/\\/g, '/');
  let prefix = '';
  let rest = t;
  let forceLower = false;
  const unc = /^\/\/([^/]+\/[^/]+)(\/|$)/.exec(t);
  if (unc) {
    prefix = `//${unc[1]?.toLowerCase() ?? ''}/`;
    rest = t.slice(unc[0].length - (unc[0].endsWith('/') ? 1 : 0));
    forceLower = true;
  } else if (/^[a-zA-Z]:\//.test(t)) {
    prefix = `${(t[0] ?? '').toLowerCase()}:/`;
    rest = t.slice(3);
    forceLower = true;
  } else if (t.startsWith('/')) {
    prefix = '/';
    rest = t.slice(1);
  }
  const rooted = prefix !== '';
  const parts: string[] = [];
  for (const seg of rest.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (parts.length > 0 && parts[parts.length - 1] !== '..') parts.pop();
      else if (!rooted) parts.push(seg);
      continue;
    }
    parts.push(seg);
  }
  const joined = prefix + parts.join('/');
  return forceLower ? joined.toLowerCase() : joined;
}

/**
 * Collect the file changes for one turn, merged per normalized path. Mirrors
 * the original `nbe`: Write always counts as stats-incomplete (the client
 * cannot tell a new file from an overwrite), Edit/MultiEdit count lines from
 * the from-args diff when one can be built.
 */
export function turnFileChanges(turn: ChatTurn): TurnFileChange[] {
  const tools = turn.tools ?? [];
  const map = new Map<string, TurnFileChange>();
  for (const tool of tools) {
    if (tool.status === 'error') continue;
    const kind = normalizeToolName(tool.name);
    if (!DIFF_KINDS.has(kind)) continue;
    const path = extractEditPath(tool.arg);
    if (!path) continue;
    const norm = normalizeTurnPath(path);
    let added = 0;
    let removed = 0;
    let hasWrite = false;
    let statsIncomplete = false;
    let diff: DiffViewLine[] | null = null;
    if (kind === 'write') {
      hasWrite = true;
      statsIncomplete = true;
    } else {
      diff = buildEditDiffLines(tool);
      if (diff) {
        const c = countAddedRemoved(diff);
        added = c.added;
        removed = c.removed;
      } else {
        statsIncomplete = true;
      }
    }
    const existing = map.get(norm);
    if (existing) {
      existing.added += added;
      existing.removed += removed;
      existing.hasWrite = existing.hasWrite || hasWrite;
      existing.statsIncomplete = existing.statsIncomplete || statsIncomplete;
      if (existing.diff !== null && diff !== null) {
        // Merge with cumulative line offsets + hunk separator (original `nbe`).
        let maxOld = 0;
        let maxNew = 0;
        for (const row of existing.diff) {
          if (row.oldNo !== undefined && row.oldNo > maxOld) maxOld = row.oldNo;
          if (row.newNo !== undefined && row.newNo > maxNew) maxNew = row.newNo;
        }
        const offsetRows: DiffViewLine[] = diff.map((row) => ({
          ...row,
          oldNo: row.oldNo !== undefined ? row.oldNo + maxOld : undefined,
          newNo: row.newNo !== undefined ? row.newNo + maxNew : undefined,
        }));
        existing.diff = [...existing.diff, { type: 'hunk', text: '···' }, ...offsetRows];
      } else {
        existing.diff = null;
      }
    } else {
      map.set(norm, { path, added, removed, hasWrite, statsIncomplete, diff, toolId: tool.id });
    }
  }
  return [...map.values()];
}

/** First tool call in the turn that produced changes (for panel lookups). */
export function turnChangedToolIds(turn: ChatTurn): string[] {
  return (turn.tools ?? [])
    .filter((t) => t.status !== 'error' && DIFF_KINDS.has(normalizeToolName(t.name)))
    .map((t) => t.id);
}

/** Relativize a path against the workspace cwd (null when outside it). */
export function relativizePath(path: string, cwd: string): string | null {
  const p = normalizeTurnPath(path);
  const c = normalizeTurnPath(cwd);
  if (p === c) return '';
  if (p.startsWith(c.endsWith('/') ? c : `${c}/`)) {
    return p.slice(c.endsWith('/') ? c.length : c.length + 1);
  }
  return null;
}
