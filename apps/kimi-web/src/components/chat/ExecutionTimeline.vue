<!-- apps/kimi-web/src/components/chat/ExecutionTimeline.vue -->
<!-- Collapsible Agent Activity Timeline with Expandable Tool Cards.
     Wraps the entire assistant turn: a "Worked Xs" header with expand/collapse,
     nested ThinkingBlock + ToolCalls inside, and the final text always visible.
     Mobile-first. Uses the same grid-collapse idiom as ToolRow/ToolGroup. -->
<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '../ui/Icon.vue';
import StatusDot from '../ui/StatusDot.vue';
import Markdown from './Markdown.vue';
import ThinkingBlock from './ThinkingBlock.vue';
import ToolCall from './ToolCall.vue';
import ToolGroup from './ToolGroup.vue';
import { assistantRenderBlocks, formatDuration } from '../chatTurnRendering';
import type { AssistantRenderBlock } from '../chatTurnRendering';
import type { ChatTurn, FilePreviewRequest, ToolMedia } from '../../types';

const props = withDefaults(
  defineProps<{
    turn: ChatTurn;
    mobile?: boolean;
    toolDiffPanel?: boolean;
    streaming?: boolean;
  }>(),
  { mobile: false, toolDiffPanel: false, streaming: false },
);

const emit = defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
  openThinking: [payload: { turnId: string; blockIndex: number }];
}>();

const { t } = useI18n();

// --- Timeline collapse state ---
// Default: collapsed (intermediate work hidden, only final text visible)
const timelineOpen = ref(false);
const headEl = ref<HTMLElement | null>(null);
const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});

function toggleTimeline(): void {
  timelineOpen.value = !timelineOpen.value;
  const el = headEl.value;
  if (el) nextTick(() => pinScroll(el));
}

// --- Computed helpers ---
const blocks = computed(() => assistantRenderBlocks(props.turn));

// Separate thinking blocks, tool blocks/stacks, and text blocks
const thinkingBlocks = computed(() =>
  blocks.value.filter((b): b is Extract<AssistantRenderBlock, { kind: 'thinking' }> => b.kind === 'thinking'),
);

const toolBlocks = computed(() =>
  blocks.value.filter((b): b is Extract<AssistantRenderBlock, { kind: 'tool' | 'tool-stack' }> =>
    b.kind === 'tool' || b.kind === 'tool-stack',
  ),
);

const textBlocks = computed(() =>
  blocks.value.filter((b): b is Extract<AssistantRenderBlock, { kind: 'text' }> => b.kind === 'text' && b.text),
);

// Flat list of individual tools (for counting)
const toolCount = computed(() => {
  let count = 0;
  for (const b of toolBlocks.value) {
    if (b.kind === 'tool-stack') count += b.tools.length;
    else count += 1;
  }
  return count;
});

const hasThinking = computed(() => thinkingBlocks.value.length > 0);
const hasTools = computed(() => toolCount.value > 0);
const hasWork = computed(() => hasThinking.value || hasTools.value);

// Aggregate status across all tools (for the status dot)
const aggregateStatus = computed<'running' | 'ok' | 'error'>(() => {
  for (const b of toolBlocks.value) {
    if (b.kind === 'tool') {
      if (b.tool.status === 'running') return 'running';
      if (b.tool.status === 'error') return 'error';
    }
    if (b.kind === 'tool-stack') {
      for (const item of b.tools) {
        if (item.tool.status === 'running') return 'running';
        if (item.tool.status === 'error') return 'error';
      }
    }
  }
  return 'ok';
});

const statusLabel = computed(() => {
  switch (aggregateStatus.value) {
    case 'running': return t('tools.group.running');
    case 'error': return t('tools.group.error');
    default: return t('tools.group.done');
  }
});

// Tool group label: "3 tool calls" / "3 tool calls · running"
const toolGroupLabel = computed(() =>
  t('tools.group.title', toolCount.value),
);
</script>

<template>
  <div class="et" :class="{ 'has-work': hasWork }">
    <!-- Timeline header: clickable, shows duration + tool summary + status -->
    <button
      v-if="hasWork"
      ref="headEl"
      class="et-head"
      type="button"
      :aria-expanded="timelineOpen"
      @click="toggleTimeline"
    >
      <StatusDot :status="aggregateStatus" />
      <span v-if="turn.durationMs !== undefined" class="et-duration">
        {{ t('tools.worked', { time: formatDuration(turn.durationMs) }) }}
      </span>
      <span class="et-summary">
        {{ toolGroupLabel }}
        <span v-if="hasThinking" class="et-thinking-badge">Thinking</span>
      </span>
      <span class="et-status-text">{{ statusLabel }}</span>
      <Icon class="et-car" :name="timelineOpen ? 'chevron-down' : 'chevron-right'" size="sm" />
    </button>

    <!-- Collapsible body: thinking blocks + tool calls/stacks -->
    <div v-if="hasWork" class="et-body" :class="{ open: timelineOpen }" :inert="!timelineOpen">
      <div class="et-body-inner">
        <!-- Thinking blocks (rendered as a teaser, click opens side panel) -->
        <ThinkingBlock
          v-for="blk in thinkingBlocks"
          :key="'thinking-' + blk.sourceIndex"
          :text="blk.thinking"
          :mobile="mobile"
          :streaming="streaming"
          @open="emit('openThinking', { turnId: turn.id, blockIndex: blk.sourceIndex })"
        />

        <!-- Tool groups and individual tool calls -->
        <template v-for="(blk, bi) in toolBlocks" :key="'tool-' + bi">
          <ToolGroup
            v-if="blk.kind === 'tool-stack'"
            :tools="blk.tools"
            :mobile="mobile"
            :tool-diff-panel="toolDiffPanel"
            @open-media="emit('openMedia', $event)"
            @open-file="emit('openFile', $event)"
            @open-tool-diff="emit('openToolDiff', $event)"
            @open-agent="emit('openAgent', $event)"
          />
          <ToolCall
            v-else
            :tool="blk.tool"
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

    <!-- Final assistant response: ALWAYS visible regardless of collapse state -->
    <div
      v-for="blk in textBlocks"
      :key="'text-' + blk.sourceIndex"
      class="et-text"
    >
      <Markdown :text="blk.text" :streaming="streaming" :open-file="(target: FilePreviewRequest) => emit('openFile', target)" />
    </div>
  </div>
</template>

<style scoped>
/* ---- Root container ---- */
.et {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

/* ---- Header button ---- */
.et-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 11px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: background var(--duration-base) var(--ease-out),
              border-color var(--duration-base) var(--ease-out);
}
.et-head:hover {
  background: var(--color-surface-sunken);
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-line));
  color: var(--color-text);
}
.et-head:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-soft);
}
.et.has-work .et-head {
  margin-bottom: var(--space-1);
}

.et-duration {
  font-weight: var(--weight-medium);
  color: var(--color-text);
}
.et-summary {
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: 6px;
}
.et-thinking-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  height: 18px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
}
.et-status-text {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}
.et-car {
  margin-left: auto;
  color: var(--color-text-faint);
  flex: none;
  transition: transform var(--duration-base) var(--ease-out);
}
.et-head:hover .et-car {
  color: var(--color-text-muted);
}

/* ---- Collapsible body (grid collapse pattern from ToolRow) ---- */
.et-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.et-body.open {
  grid-template-rows: minmax(0, 1fr);
}
.et-body-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-left: var(--space-3);
  border-left: 2px solid var(--color-line);
  margin-left: var(--space-2);
}

/* ---- Final text: always visible ---- */
.et-text {
  color: var(--color-text);
  font: var(--text-base)/var(--leading-relaxed) var(--font-ui);
  font-weight: 425;
  word-break: break-word;
}

/* ---- Mobile tweaks ---- */
.et-head {
  min-height: 28px;
  padding: 2px 8px;
  font-size: var(--text-xs);
}
.et-body-inner {
  padding-left: var(--space-2);
  margin-left: var(--space-1);
  gap: 2px;
}
</style>
