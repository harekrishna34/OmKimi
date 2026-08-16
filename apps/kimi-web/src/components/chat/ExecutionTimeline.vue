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
  <div class="execution-timeline" :class="{ 'has-work': hasWork, open }">
    <div v-if="hasWork" class="et-work">
      <button
        class="et-head"
        type="button"
        :aria-expanded="open"
        :aria-label="workedLabel"
        @click="toggle"
      >
        <StatusDot :status="workStatus" />
        <span class="et-title">{{ workedLabel }}</span>
        <span v-if="toolCount > 0" class="et-count">· {{ toolCount }} tool{{ toolCount === 1 ? '' : 's' }}</span>
        <span class="et-state">· {{ workLabel }}</span>
        <Icon class="et-chevron" name="chevron-right" size="sm" />
      </button>

      <div class="et-body" :class="{ open }" :inert="!open">
        <div class="et-body-inner">
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

    <div v-if="finalText" class="et-final msg">
      <Markdown :text="finalText" :streaming="streaming" :open-file="(target) => emit('openFile', target)" />
    </div>
  </div>
</template>

<style scoped>
.execution-timeline {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: var(--color-text);
}
.et-work {
  width: 100%;
}
.et-head {
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
}
.et-head:hover { color: var(--color-text); }
.et-head:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
}
.et-title { color: var(--color-text-muted); font-weight: var(--weight-medium); }
.et-count, .et-state { color: var(--color-text-faint); }
.et-chevron {
  margin-left: 2px;
  color: var(--color-text-faint);
  transition: transform var(--duration-base) var(--ease-out);
}
.execution-timeline.open .et-chevron { transform: rotate(90deg); }
.et-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-slow) var(--ease-out), opacity var(--duration-base) var(--ease-out);
  opacity: 0;
}
.et-body.open {
  grid-template-rows: minmax(0, 1fr);
  opacity: 1;
}
.et-body-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--chat-block-gap);
  padding: 2px 0 1px 18px;
}
.et-final {
  margin-top: var(--chat-block-gap);
  font-size: var(--ui-font-size);
  line-height: 1.6;
  color: var(--color-text);
  font-weight: 500;
}
.et-final :deep(p) { margin: 0; }
.et-final :deep(p + p) { margin-top: 8px; }
</style>
