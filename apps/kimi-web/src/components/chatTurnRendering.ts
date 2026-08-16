// apps/kimi-web/src/components/chatTurnRendering.ts
// Pure turn-rendering helpers: pure functions of their arguments (no Vue
// reactivity, no component state). Shared by ChatPane.vue's template and its
// stateful copy/edit helpers.
//
// Grouping mirrors the original Railway web UI: consecutive thinking + tool
// blocks accumulate into ONE activity-run group (thinking renders INSIDE the
// group between tool rows); a text block — or a tool that renders no card —
// flushes the run. A settled turn therefore collapses into one compact
// "Worked Xs" fold whose groups are one-line summaries.
import type { ChatTurn, ToolCall, TurnBlock } from '../types';

// Shared 1024-based token formatter (lib/formatTokens); re-exported so the
// existing ChatPane import keeps working.
export { formatTokens } from '../lib/formatTokens';

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = ((ms % 60_000) / 1000).toFixed(1);
  return `${m}m${s}s`;
}

/**
 * Integer elapsed formatter matching the original UI's fold/tool timings:
 * seconds → "Ns", minutes → "Nm" / "NmNs", hours → "Nh" / "NhNm".
 * Zero seconds formats as "" (callers use it to fall back to a generic label).
 */
export function formatElapsed(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  if (t < 60) return t === 0 ? '' : `${t}s`;
  const m = Math.floor(t / 60);
  if (m < 60) {
    const s = t % 60;
    return s === 0 ? `${m}m` : `${m}m${s}s`;
  }
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0 ? `${h}h` : `${h}h${mm}m`;
}

// Ordered render blocks for an assistant turn. messagesToTurns supplies `blocks`
// (thinking + text + tool cards in call order); fall back to deriving them from
// the aggregate fields for any turn built without blocks (e.g. unit tests).
export function turnBlocks(turn: ChatTurn): TurnBlock[] {
  if (turn.blocks) return turn.blocks;
  const blocks: TurnBlock[] = [];
  if (turn.thinking) blocks.push({ kind: 'thinking', thinking: turn.thinking });
  if (turn.text) blocks.push({ kind: 'text', text: turn.text });
  for (const tool of turn.tools ?? []) blocks.push({ kind: 'tool', tool });
  return blocks;
}

// ---------------------------------------------------------------------------
// Activity grouping
// ---------------------------------------------------------------------------

/** One entry inside an activity-run group: a thinking segment or a tool card,
 *  kept in call order so thinking renders exactly where it happened. */
export type ActivityItem =
  | {
      kind: 'thinking';
      thinking: string;
      startedAt?: string;
      durationMs?: number;
      sourceIndex: number;
    }
  | { kind: 'tool'; tool: ToolCall; sourceIndex: number };

export type AssistantRenderBlock =
  | { kind: 'thinking'; thinking: string; startedAt?: string; durationMs?: number; sourceIndex: number }
  | { kind: 'text'; text: string; sourceIndex: number }
  | { kind: 'tool'; tool: ToolCall; sourceIndex: number }
  | { kind: 'activity-run'; items: ActivityItem[] };

export function rendersToolCard(block: Extract<TurnBlock, { kind: 'tool' }>): boolean {
  return !(block.tool.status === 'ok' && block.tool.media);
}

/**
 * Build the ordered render blocks for an assistant turn. Consecutive thinking
 * and renderable-tool blocks accumulate into one activity-run (thinking stays
 * INSIDE the group); a text block or a media tool (no card) flushes the run.
 * A run of exactly one item is pushed as that item alone — a single thinking
 * block renders standalone, matching the original UI.
 */
export function assistantRenderBlocks(turn: ChatTurn): AssistantRenderBlock[] {
  const blocks = turnBlocks(turn);
  const rendered: AssistantRenderBlock[] = [];
  let run: ActivityItem[] = [];

  const flushRun = (): void => {
    if (run.length === 1) {
      const [item] = run;
      if (!item) return;
      if (item.kind === 'thinking') {
        rendered.push({
          kind: 'thinking',
          thinking: item.thinking,
          startedAt: item.startedAt,
          durationMs: item.durationMs,
          sourceIndex: item.sourceIndex,
        });
      } else {
        rendered.push({ kind: 'tool', tool: item.tool, sourceIndex: item.sourceIndex });
      }
    } else if (run.length > 1) {
      rendered.push({ kind: 'activity-run', items: run });
    }
    run = [];
  };

  blocks.forEach((block, sourceIndex) => {
    if (block.kind === 'thinking') {
      run.push({
        kind: 'thinking',
        thinking: block.thinking,
        startedAt: block.startedAt,
        durationMs: block.durationMs,
        sourceIndex,
      });
      return;
    }
    if (block.kind === 'tool') {
      if (rendersToolCard(block)) {
        run.push({ kind: 'tool', tool: block.tool, sourceIndex });
        return;
      }
      flushRun();
      rendered.push({ kind: 'tool', tool: block.tool, sourceIndex });
      return;
    }
    flushRun();
    if (block.kind === 'text') {
      rendered.push({ kind: 'text', text: block.text, sourceIndex });
    }
  });

  flushRun();
  return rendered;
}

/**
 * Split an assistant turn into the collapsible "work" part and the always
 * visible tail. The final text block (and everything after it) stays visible;
 * everything before it is wrapped in the turn-fold. With no text, the first
 * media tool (no card) becomes the boundary. Mirrors the original UI.
 */
export function splitTurnBlocks(
  turn: ChatTurn,
): { folded: AssistantRenderBlock[]; visible: AssistantRenderBlock[] } {
  const blocks = turnBlocks(turn);
  let n = -1;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (b?.kind === 'text' && b.text.trim().length > 0) {
      n = i;
      break;
    }
  }
  if (n === -1) {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b?.kind === 'tool' && !rendersToolCard(b)) {
        n = i;
        break;
      }
    }
    if (n === -1) return { folded: assistantRenderBlocks(turn), visible: [] };
  }
  return {
    folded: assistantRenderBlocks({ ...turn, blocks: blocks.slice(0, n) }),
    visible: assistantRenderBlocks({ ...turn, blocks: blocks.slice(n) }),
  };
}

// ---------------------------------------------------------------------------
// Turn timing (for the "Worked Xs" fold label)
// ---------------------------------------------------------------------------

/** Earliest moment the turn is known to have started: the first thinking
 *  segment's timestamp, or the message's createdAt (whichever is earlier). */
export function turnStartMs(turn: ChatTurn): number | undefined {
  let t: number | undefined;
  for (const b of turnBlocks(turn)) {
    if (b.kind !== 'thinking' || b.startedAt === undefined) continue;
    const p = Date.parse(b.startedAt);
    if (Number.isNaN(p)) continue;
    if (t === undefined || p < t) t = p;
  }
  const createdMs = turn.createdAt !== undefined ? Date.parse(turn.createdAt) : NaN;
  if (Number.isNaN(createdMs)) return t;
  return t === undefined ? createdMs : Math.min(t, createdMs);
}

/** Settled duration in ms, when known: prefer the daemon's turn duration,
 *  else the span between the first thinking timestamp and the turn end. */
export function settledTurnDurationMs(turn: ChatTurn): number | undefined {
  if (turn.durationMs !== undefined) return Math.max(0, turn.durationMs);
  const start = turnStartMs(turn);
  if (start === undefined || turn.endedAt === undefined) return undefined;
  const end = Date.parse(turn.endedAt);
  if (Number.isNaN(end)) return undefined;
  return Math.max(0, end - start);
}

/**
 * Index of the last turn block while the turn is actively streaming, or null
 * when the turn is not streaming (or is "parked" — waiting on an approval for
 * a running tool, where the original UI drops the tail marker). Settled
 * thinking blocks never count as a live tail.
 */
export function streamingTailIndex(
  turn: ChatTurn,
  isStreamingTurn: boolean,
  hasBlockingApproval: (toolCallId: string) => boolean,
): number | null {
  if (!isStreamingTurn) return null;
  const blocks = turnBlocks(turn);
  const last = blocks.at(-1);
  if (last?.kind === 'thinking' && last.durationMs !== undefined) return null;
  if (last?.kind === 'tool' && last.tool.status === 'running' && hasBlockingApproval(last.tool.id)) {
    return null;
  }
  return blocks.length - 1;
}

/** Whether a standalone render block (thinking/text/tool) is the live tail of
 *  a streaming turn. */
export function isStreamingBlock(
  block: { kind: string; sourceIndex: number; durationMs?: number },
  tailIndex: number | null,
): boolean {
  if (tailIndex === null) return false;
  if (block.kind === 'thinking' && block.durationMs !== undefined) return false;
  return block.sourceIndex === tailIndex;
}

/** Whether an activity-run group is the live tail of a streaming turn (its
 *  LAST item carries the tail source index). */
export function isStreamingGroup(
  group: { items: ActivityItem[] },
  tailIndex: number | null,
): boolean {
  if (tailIndex === null) return false;
  const last = group.items.at(-1);
  if (!last) return false;
  if (last.kind === 'thinking' && last.durationMs !== undefined) return false;
  return last.sourceIndex === tailIndex;
}

// ---------------------------------------------------------------------------
// Final text / markdown / keys
// ---------------------------------------------------------------------------

export function turnFinalText(turn: ChatTurn): string {
  return turnBlocks(turn)
    .flatMap((blk) => (blk.kind === 'text' && blk.text ? [blk.text] : []))
    .join('\n\n');
}

/** Convert a single turn to Markdown. */
export function turnToMarkdown(turn: ChatTurn): string {
  const parts: string[] = [];
  for (const blk of turnBlocks(turn)) {
    if (blk.kind === 'thinking' && blk.thinking) {
      parts.push(`> **Thinking**\n> ${blk.thinking.split('\n').join('\n> ')}`);
    } else if (blk.kind === 'text' && blk.text) {
      parts.push(blk.text);
    } else if (blk.kind === 'tool' && blk.tool.output && blk.tool.output.length > 0) {
      const output = blk.tool.output.join('\n');
      parts.push(`\`\`\`\n[${blk.tool.name}]\n${output}\n\`\`\``);
    }
  }
  return parts.join('\n\n');
}

export function renderBlockKey(block: AssistantRenderBlock, index: number): string {
  if (block.kind === 'activity-run') {
    return `activity-run-${block.items[0]?.sourceIndex ?? index}`;
  }
  if (block.kind === 'tool') return block.tool.id || `tool-${block.sourceIndex}`;
  return `${block.kind}-${block.sourceIndex}`;
}
