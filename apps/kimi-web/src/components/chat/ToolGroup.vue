<!-- apps/kimi-web/src/components/chat/ToolGroup.vue -->
<!-- Activity-run style wrapper matching the original Railway UI:
     .activity-run > .ar-head (glyph + summary + chevron) + .ar-body (grid collapse). -->
<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToolCall from './ToolCall.vue';
import { toolStackKey, toolStackPosition } from '../chatTurnRendering';
import type { ToolStackItem } from '../chatTurnRendering';
import type { FilePreviewRequest, ToolMedia } from '../../types';
import { normalizeToolName } from '../../lib/toolMeta';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    tools: ToolStackItem[];
    mobile?: boolean;
    toolDiffPanel?: boolean;
  }>(),
  { mobile: false, toolDiffPanel: false },
);

const emit = defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
}>();

const open = ref(true);

const count = computed(() => props.tools.length);
const aggregateStatus = computed<'running' | 'error' | 'done'>(() => {
  if (props.tools.some((t) => t.tool.status === 'running')) return 'running';
  if (props.tools.some((t) => t.tool.status === 'error')) return 'error';
  return 'done';
});
const { t } = useI18n();

const allSearch = computed(() =>
  props.tools.length > 0 && props.tools.every((t) => normalizeToolName(t.tool.name) === 'search'),
);

const groupLabel = computed(() => {
  const c = count.value;
  if (allSearch.value) {
    return c === 1 ? t('tools.group.ranOneWebSearch') : t('tools.group.ranWebSearches', c);
  }
  return t('tools.group.title', c);
});

const glyphKind = computed(() => {
  if (aggregateStatus.value === 'running') return 'run';
  if (aggregateStatus.value === 'error') return 'err';
  return 'ok';
});

function toggle(): void {
  open.value = !open.value;
}

const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});
const headEl = ref<HTMLElement | null>(null);

function onHeadClick(): void {
  toggle();
  const el = headEl.value;
  if (el) nextTick(() => pinScroll(el));
}
</script>

<template>
  <div class="activity-run" :class="{ open }">
    <button class="ar-head" ref="headEl" type="button" :aria-expanded="open" @click="onHeadClick">
      <span class="ar-glyph" :class="glyphKind" aria-hidden="true">
        <Icon v-if="glyphKind === 'ok'" name="check" size="sm" />
        <Icon v-else-if="glyphKind === 'err'" name="close" size="sm" />
        <Icon v-else name="list" size="sm" />
      </span>
      <span class="ar-sum">{{ groupLabel }}</span>
      <Icon class="ar-car" name="chevron-right" size="sm" />
    </button>
    <div class="ar-body" :class="{ open }" :inert="!open">
      <div class="ar-body-inner">
        <ToolCall
          v-for="(item, si) in tools"
          :key="toolStackKey(item)"
          :tool="item.tool"
          :mobile="mobile"
          :stack-position="toolStackPosition(si, tools.length)"
          :tool-diff-panel="toolDiffPanel"
          @open-media="emit('openMedia', $event)"
          @open-file="emit('openFile', $event)"
          @open-tool-diff="emit('openToolDiff', $event)"
          @open-agent="emit('openAgent', $event)"
        />
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

.ar-sum {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--weight-regular);
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
