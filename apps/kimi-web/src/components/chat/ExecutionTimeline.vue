<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ChatTurn, FilePreviewRequest, ToolMedia } from '../../types';
import {
  assistantRenderBlocks,
  renderBlockKey,
  turnFinalText,
  type AssistantRenderBlock,
} from '../chatTurnRendering';
import ThinkingBlock from './ThinkingBlock.vue';
import ToolCall from './ToolCall.vue';
import ToolGroup from './ToolGroup.vue';
import Markdown from './Markdown.vue';
import Icon from '../ui/Icon.vue';
import StatusDot from '../ui/StatusDot.vue';

const props = withDefaults(
  defineProps<{
    turn: ChatTurn;
    streaming?: boolean;
    mobile?: boolean;
    toolDiffPanel?: boolean;
    duration?: string;
  }>(),
  {
    streaming: false,
    mobile: false,
    toolDiffPanel: false,
    duration: '',
  },
);

const emit = defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
  openThinking: [blockIndex: number];
}>();

const { t } = useI18n();
const open = ref(props.streaming);

const blocks = computed(() => assistantRenderBlocks(props.turn));
const workBlocks = computed(() => blocks.value.filter((block) => block.kind !== 'text'));
const finalText = computed(() => turnFinalText(props.turn));
const hasWork = computed(() => workBlocks.value.length > 0);
const toolCount = computed(() =>
  workBlocks.value.reduce((count, block) => {
    if (block.kind === 'tool') return count + 1;
    if (block.kind === 'tool-stack') return count + block.tools.length;
    return count;
  }, 0),
);
const workStatus = computed<'running' | 'error' | 'done'>(() => {
  const tools = props.turn.tools ?? [];
  if (props.streaming || tools.some((tool) => tool.status === 'running')) return 'running';
  if (tools.some((tool) => tool.status === 'error')) return 'error';
  return 'done';
});
const workLabel = computed(() => {
  if (workStatus.value === 'running') return t('tools.group.running');
  if (workStatus.value === 'error') return t('tools.group.error');
  return t('tools.group.done');
});
const workedLabel = computed(() =>
  props.duration ? t('tools.worked', { time: props.duration }) : t('tools.workedPending'),
);

watch(
  () => props.streaming,
  (streaming) => {
    if (streaming) open.value = true;
    else if (hasWork.value) open.value = false;
  },
);

function toggle(): void {
  if (hasWork.value) open.value = !open.value;
}

function isStreamingBlock(block: AssistantRenderBlock): boolean {
  return props.streaming && block === workBlocks.value.at(-1);
}
</script>

<template>
  <div class="tl-main" :class="{ 'has-work': hasWork, open }">
    <!-- Timeline header: collapsible row showing worked time, tool count, status -->
    <div v-if="hasWork" class="tl-work">
      <button
        class="tl-head"
        type="button"
        :aria-expanded="open"
        :aria-label="workedLabel"
        @click="toggle"
      >
        <StatusDot :status="workStatus" />
        <span class="tl-title">{{ workedLabel }}</span>
        <span v-if="toolCount > 0" class="tl-pill">{{ toolCount }} tool{{ toolCount === 1 ? '' : 's' }}</span>
        <span class="tl-status">{{ workLabel }}</span>
        <Icon class="tl-car" name="chevron-right" size="sm" />
      </button>

      <!-- Collapsible body: thinking + tool calls -->
      <div class="tl-body" :class="{ open }" :inert="!open">
        <div class="tl-body-inner">
          <template v-for="(block, index) in workBlocks" :key="renderBlockKey(block, index)">
            <ThinkingBlock
              v-if="block.kind === 'thinking'"
              :text="block.thinking"
              :mobile="mobile"
              :streaming="isStreamingBlock(block)"
              @open="emit('openThinking', block.sourceIndex)"
            />
            <ToolGroup
              v-else-if="block.kind === 'tool-stack'"
              :tools="block.tools"
              :mobile="mobile"
              :tool-diff-panel="toolDiffPanel"
              @open-media="emit('openMedia', $event)"
              @open-file="emit('openFile', $event)"
              @open-tool-diff="emit('openToolDiff', $event)"
              @open-agent="emit('openAgent', $event)"
            />
            <ToolCall
              v-else-if="block.kind === 'tool'"
              :tool="block.tool"
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

    <!-- Final assistant response text -->
    <div v-if="finalText" class="tl-final msg">
      <Markdown :text="finalText" :streaming="streaming" :open-file="(target) => emit('openFile', target)" />
    </div>
  </div>
</template>

<style scoped>
/* Timeline main container */
.tl-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: var(--color-text);
}

.tl-work {
  width: 100%;
}

/* Timeline header: clickable row with worked time, tool count, status */
.tl-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 30px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--text-base);
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}
.tl-head:hover { color: var(--color-text); }
.tl-head:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
}

.tl-title {
  color: var(--color-text-muted);
  font-weight: var(--weight-medium);
}

.tl-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: 1.4;
}

.tl-status {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.tl-car {
  margin-left: 2px;
  color: var(--color-text-faint);
  transition: transform var(--duration-base) var(--ease-out);
}
.tl-main.open .tl-car { transform: rotate(90deg); }

/* Timeline body: collapsible section with thinking + tool calls */
.tl-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-slow) var(--ease-out), opacity var(--duration-base) var(--ease-out);
  opacity: 0;
}
.tl-body.open {
  grid-template-rows: minmax(0, 1fr);
  opacity: 1;
}

.tl-body-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--chat-block-gap);
  padding: 2px 0 1px 18px;
}

/* Final assistant response text */
.tl-final {
  margin-top: var(--chat-block-gap);
  font-size: var(--ui-font-size);
  line-height: 1.6;
  color: var(--color-text);
  font-weight: 500;
}
.tl-final :deep(p) { margin: 0; }
.tl-final :deep(p + p) { margin-top: 8px; }
</style>
