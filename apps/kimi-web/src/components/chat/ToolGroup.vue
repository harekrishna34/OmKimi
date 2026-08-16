<!-- apps/kimi-web/src/components/chat/ToolGroup.vue -->
<!-- Activity-run wrapper matching the original Railway UI:
     .activity-run > .ar-head (glyph + fragment summary + chevron) + .ar-body (grid collapse).
     A group auto-opens when a tool inside it starts running and auto-collapses
     once it settles; finished groups stay collapsed one-liners. Thinking
     segments render INSIDE the group between tool rows. -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ToolCall from './ToolCall.vue';
import ThinkingBlock from './ThinkingBlock.vue';
import { formatElapsed, type ActivityItem } from '../chatTurnRendering';
import type { FilePreviewRequest, ToolMedia } from '../../types';
import { normalizeToolName, toolGlyph, toolSummary } from '../../lib/toolMeta';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    /** Thinking + tool entries in call order. */
    items: ActivityItem[];
    mobile?: boolean;
    /** True while the containing turn is actively streaming. */
    streaming?: boolean;
    toolDiffPanel?: boolean;
  }>(),
  { mobile: false, streaming: false, toolDiffPanel: false },
);

const emit = defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
}>();

const { t } = useI18n();

// ---------------------------------------------------------------------------
// Status + open state (mirrors the original ActivityRun)
// ---------------------------------------------------------------------------

const lastItem = computed(() => props.items.at(-1));

/** The item that is "live": while streaming a trailing thinking segment, else
 *  the last still-running tool (searching from the end). */
const currentItem = computed<ActivityItem | null>(() => {
  const s = lastItem.value;
  if (props.streaming && s?.kind === 'thinking') return s;
  for (let i = props.items.length - 1; i >= 0; i--) {
    const it = props.items[i];
    if (it?.kind === 'tool' && it.tool.status === 'running') return it;
  }
  return null;
});

const aggregateStatus = computed<'running' | 'error' | 'done'>(() => {
  if (props.streaming) return 'running';
  for (const it of props.items) {
    if (it.kind === 'tool' && it.tool.status === 'running') return 'running';
  }
  for (const it of props.items) {
    if (it.kind === 'tool' && it.tool.status === 'error') return 'error';
  }
  return 'done';
});

const open = ref(aggregateStatus.value === 'running');

// Group timing: start = earliest thinking startedAt (or now), settle computes
// the elapsed duration shown as the faint trailing clause.
const startedAtMs = ref<number | null>(null);
const durationMs = ref<number | undefined>(undefined);
const nowTick = ref(Date.now());

function earliestThinkingStart(): number | null {
  let t: number | null = null;
  for (const it of props.items) {
    if (it.kind !== 'thinking' || it.startedAt === undefined) continue;
    const p = Date.parse(it.startedAt);
    if (Number.isNaN(p)) continue;
    if (t === null || p < t) t = p;
  }
  return t;
}

watch(
  aggregateStatus,
  (status, prev) => {
    if (status === 'running') {
      if (prev !== undefined && prev !== 'running') open.value = true;
      if (startedAtMs.value === null) startedAtMs.value = earliestThinkingStart() ?? Date.now();
      durationMs.value = undefined;
      nowTick.value = Date.now();
      const timer = setInterval(() => {
        nowTick.value = Date.now();
      }, 1000);
      return () => clearInterval(timer);
    }
    if (prev === 'running') {
      open.value = false;
      if (startedAtMs.value !== null) durationMs.value = Date.now() - startedAtMs.value;
      startedAtMs.value = null;
    }
  },
  { immediate: true },
);

function toggle(): void {
  open.value = !open.value;
  if (props.streaming) return;
  const el = headEl.value;
  if (el) nextTick(() => pinScroll(el));
}

const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});
const headEl = ref<HTMLElement | null>(null);

// ---------------------------------------------------------------------------
// Glyph
// ---------------------------------------------------------------------------

const glyph = computed<'check' | 'close' | 'thinking' | 'tool'>(() => {
  if (aggregateStatus.value === 'done') return 'check';
  if (aggregateStatus.value === 'error') return 'close';
  const cur = currentItem.value ?? lastItem.value;
  return cur?.kind === 'thinking' ? 'thinking' : 'tool';
});

const toolGlyphSvg = computed(() => {
  if (glyph.value !== 'tool') return '';
  const cur = currentItem.value ?? lastItem.value;
  return cur?.kind === 'tool' ? toolGlyph(cur.tool.name) : '';
});

// ---------------------------------------------------------------------------
// Head summary fragments ("Read 1 file · Wrote 1 file" style)
// ---------------------------------------------------------------------------

/** Tool kinds with a dedicated plural label; everything else falls back to
 *  the generic "{count} tool call(s)". */
const TYPED_KINDS = new Set(['read', 'bash', 'grep', 'search', 'glob', 'ls', 'web_fetch', 'edit', 'write']);

function kindOf(name: string): string {
  const k = normalizeToolName(name);
  return k === 'multi_edit' ? 'edit' : k;
}

interface Fragment {
  text: string;
  tone?: 'normal' | 'danger' | 'faint';
}
interface Clause {
  fragments: Fragment[];
}

function clausesByKind(
  items: ActivityItem[],
): { order: string[]; byKind: Map<string, { count: number; errors: number }> } {
  const order: string[] = [];
  const byKind = new Map<string, { count: number; errors: number }>();
  for (const it of items) {
    if (it.kind === 'thinking') continue;
    const kind = kindOf(it.tool.name);
    let entry = byKind.get(kind);
    if (!entry) {
      entry = { count: 0, errors: 0 };
      byKind.set(kind, entry);
      order.push(kind);
    }
    entry.count++;
    if (it.tool.status === 'error') entry.errors++;
  }
  return { order, byKind };
}

function doneLabel(kind: string, count: number): string {
  return TYPED_KINDS.has(kind)
    ? t(`tools.group.typed.${kind}.done`, { count })
    : t('tools.group.countOther', { count });
}

function failedFragment(errors: number): Fragment {
  return { text: t('tools.activity.failedClause', { count: errors }), tone: 'danger' };
}

function plainOf(clauses: Clause[]): string {
  return clauses.map((c) => c.fragments.map((f) => f.text).join('')).join(' · ');
}

/** Settled head: per-kind counts + failures, then the faint duration clause. */
const settledClauses = computed(() => {
  const { order, byKind } = clausesByKind(props.items);
  const clauses: Clause[] = [];
  for (const kind of order) {
    const entry = byKind.get(kind);
    if (!entry) continue;
    const fragments: Fragment[] = [{ text: doneLabel(kind, entry.count) }];
    if (entry.errors > 0) fragments.push(failedFragment(entry.errors));
    clauses.push({ fragments });
  }
  if (durationMs.value !== undefined) {
    const d = formatElapsed(durationMs.value);
    if (d) clauses.push({ fragments: [{ text: d, tone: 'faint' }] });
  }
  return clauses;
});

/** Live clause for the currently-active item: "Reading path…" / "Thinking…" /
 *  "Working…". */
function liveClause(item: ActivityItem): Clause {
  if (item.kind === 'thinking') {
    return { fragments: [{ text: t('thinking.streaming') }] };
  }
  const kind = kindOf(item.tool.name);
  let subject = toolSummary(item.tool.name, item.tool.arg);
  if (kind === 'write' && subject) {
    const suffix = t('tools.chip.created');
    if (subject.endsWith(suffix)) subject = subject.slice(0, subject.length - suffix.length).trimEnd();
  }
  const text =
    subject && TYPED_KINDS.has(kind)
      ? t(`tools.activity.doing.${kind}`, { subject })
      : t('tools.activity.busy');
  return { fragments: [{ text }] };
}

/** Running head: current clause + faint "done" clauses + live elapsed. */
const runningClauses = computed(() => {
  const doneItems = props.items.filter(
    (it) => it !== currentItem.value && !(it.kind === 'tool' && it.tool.status === 'running'),
  );
  const { order, byKind } = clausesByKind(doneItems);
  const prefix = t('tools.activity.liveDonePrefix');
  const clauses: Clause[] = [];
  const cur = currentItem.value;
  if (cur) clauses.push(liveClause(cur));
  for (const kind of order) {
    const entry = byKind.get(kind);
    if (!entry) continue;
    const fragments: Fragment[] = [{ text: `${prefix}${doneLabel(kind, entry.count)}`, tone: 'faint' }];
    if (entry.errors > 0) fragments.push(failedFragment(entry.errors));
    clauses.push({ fragments });
  }
  return clauses;
});

const runningElapsed = computed(() => {
  if (aggregateStatus.value !== 'running' || startedAtMs.value === null) return '';
  return formatElapsed(nowTick.value - startedAtMs.value);
});

const headClauses = computed<Clause[]>(() => {
  if (aggregateStatus.value !== 'running') return settledClauses.value;
  const clauses = runningClauses.value;
  const elapsed = runningElapsed.value;
  if (elapsed) clauses.push({ fragments: [{ text: elapsed, tone: 'faint' }] });
  return clauses;
});

const headPlain = computed(() => plainOf(headClauses.value));

function toneClass(tone: Fragment['tone']): string {
  if (tone === 'danger') return 'ar-danger';
  if (tone === 'faint') return 'ar-faint';
  return '';
}

// Whether the LAST thinking item in this group is the live streaming one.
function isStreamingThink(item: ActivityItem): boolean {
  if (!props.streaming || item.kind !== 'thinking' || item.durationMs !== undefined) return false;
  const s = lastItem.value;
  return s !== undefined && item.sourceIndex === s.sourceIndex;
}

function itemKey(item: ActivityItem): string {
  return item.kind === 'thinking' ? `thinking-${item.sourceIndex}` : item.tool.id || `tool-${item.sourceIndex}`;
}
</script>

<template>
  <div class="activity-run" :class="{ open }">
    <button class="ar-head" ref="headEl" type="button" :aria-expanded="open" @click="toggle">
      <span
        class="ar-glyph"
        :class="{ run: aggregateStatus === 'running', err: aggregateStatus === 'error', ok: aggregateStatus === 'done' }"
        role="status"
        :aria-label="aggregateStatus"
      >
        <svg
          v-if="glyph === 'thinking'"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        ><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.3 1.5-3.5A6 6 0 0 0 6 8c0 1.2.5 2.4 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        <span v-else-if="glyph === 'tool'" class="ar-glyph-svg" v-html="toolGlyphSvg" aria-hidden="true" />
        <Icon v-else-if="glyph === 'check'" name="check" size="sm" aria-hidden="true" />
        <Icon v-else name="close" size="sm" aria-hidden="true" />
      </span>
      <span class="ar-sum" :title="headPlain">
        <template v-for="(clause, ci) in headClauses" :key="ci">
          <span v-if="ci > 0" class="ar-sep"> · </span>
          <template v-for="(frag, fi) in clause.fragments" :key="fi">
            <span :class="toneClass(frag.tone)">{{ frag.text }}</span>
          </template>
        </template>
      </span>
      <Icon class="ar-car" name="chevron-right" size="sm" aria-hidden="true" />
    </button>
    <div class="ar-body" :class="{ open }" :inert="!open">
      <div class="ar-body-inner">
        <template v-for="item in items" :key="itemKey(item)">
          <ThinkingBlock
            v-if="item.kind === 'thinking'"
            :text="item.thinking"
            :mobile="mobile"
            :streaming="isStreamingThink(item)"
            :started-at="item.startedAt"
            :duration-ms="item.durationMs"
          />
          <ToolCall
            v-else
            :tool="item.tool"
            :mobile="mobile"
            :tool-diff-panel="toolDiffPanel"
            @open-media="emit('openMedia', $event)"
            @open-file="emit('openFile', $event)"
            @open-tool-diff="emit('openToolDiff', $event)"
            @open-agent="emit('openAgent', $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-run {
  display: flex;
  flex-direction: column;
  animation: kimi-card-in var(--duration-base) var(--ease-out);
}
@keyframes kimi-card-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.ar-head {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-2) 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-faint);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  line-height: 1;
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: color var(--duration-base) var(--ease-out);
}
.ar-head:hover {
  color: var(--color-text);
}
.ar-head:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-soft);
}

.ar-glyph {
  display: inline-flex;
  align-items: center;
  flex: none;
  color: var(--color-text-faint);
}
.ar-glyph-svg {
  display: inline-flex;
  align-items: center;
}
.ar-glyph-svg :deep(svg) {
  width: 14px;
  height: 14px;
}
.ar-glyph.ok {
  color: var(--color-success);
}
.ar-glyph.err {
  color: var(--color-danger);
}
.ar-glyph.run {
  color: var(--color-text-muted);
  animation: ar-breathe 1.6s var(--ease-in-out) infinite;
}
@keyframes ar-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
@media (prefers-reduced-motion: reduce) {
  .ar-glyph.run {
    animation: none;
  }
}

.ar-sum {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--weight-regular);
}

.ar-danger {
  color: var(--color-danger);
}
.ar-faint,
.ar-sep {
  color: var(--color-text-faint);
}

.ar-car {
  color: var(--color-text-faint);
  flex: none;
  transition: transform var(--duration-base) var(--ease-out);
}
.activity-run.open .ar-car {
  transform: rotate(90deg);
}

.ar-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.ar-body.open {
  grid-template-rows: minmax(0, 1fr);
}
.ar-body-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-1);
}
</style>
