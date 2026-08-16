<!-- apps/kimi-web/src/components/chat/tool-calls/GlobTool.vue -->
<!-- Glob/ls tool row (ported from the original bundle's GlobTool, scope
     data-v-f77a6180). Glob mode lists matched files as clickable rows; ls mode
     shows the raw directory listing output. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { normalizeToolName, parseArg, str } from '../../../lib/toolMeta';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import Icon from '../../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    tool: ToolCall;
    mobile?: boolean;
    stackPosition?: 'single' | 'first' | 'middle' | 'last';
    toolDiffPanel?: boolean;
  }>(),
  { mobile: false, stackPosition: 'single', toolDiffPanel: false },
);

const emit = defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
}>();

const { t } = useI18n();

const status = computed(() => props.tool.status);
const isGlob = computed(() => normalizeToolName(props.tool.name) === 'glob');
const arg = computed(() => parseArg(props.tool.arg));
const pattern = computed(() => {
  const d = arg.value;
  return str(d?.pattern) ?? str(d?.glob) ?? str(d?.query) ?? '';
});
const dir = computed(() => {
  const d = arg.value;
  return str(d?.path) ?? str(d?.dir) ?? str(d?.directory) ?? str(d?.cwd) ?? '';
});
const files = computed(() => (props.tool.output ?? []).filter((f) => f.trim().length > 0));
const expandable = computed(() => files.value.length > 0);
const open = ref(props.tool.defaultExpanded === true && expandable.value);

watch(
  () => [props.tool.defaultExpanded, props.tool.output?.length, props.tool.status] as const,
  () => {
    if (props.tool.defaultExpanded === true && expandable.value) open.value = true;
  },
);

function openFileAt(f: string): void {
  const p = f.trim();
  if (p) emit('openFile', { path: p });
}
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="open = !open">
    <template #leading>
      <!-- The original used a `tree-view` icon for glob; our registry has no
           tree glyph, so glob uses the established `glob` (braces) glyph. -->
      <Icon :name="isGlob ? 'glob' : 'list'" size="sm" />
    </template>
    <template #trailing>
      <span v-if="isGlob && files.length > 0" class="tl-chip">
        {{ t('tools.chip.files', { count: files.length }) }}
      </span>
    </template>
    <template #body>
      <div v-if="isGlob" class="file-list">
        <button v-for="(f, i) in files" :key="i" class="file-row" type="button" @click="openFileAt(f)">
          {{ f }}
        </button>
      </div>
      <ToolOutputBlock v-else :lines="tool.output" />
    </template>
    <span class="tl-name">{{ t(isGlob ? 'tools.label.glob' : 'tools.label.ls') }}</span>
    <span v-if="isGlob && pattern" class="tl-mono">{{ pattern }}</span>
    <span v-else-if="!isGlob && dir" class="tl-mono">{{ dir }}</span>
    <span v-else class="tl-dim">{{ tool.arg }}</span>
    <span v-if="isGlob && dir" class="tl-faint">{{ dir }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-f77a6180).
   --color-well → --color-surface-sunken. */
.file-list {
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  padding: var(--space-1);
  max-height: calc(12 * 1.6 * var(--content-font-size));
  overflow-y: auto;
  overscroll-behavior: contain;
}
.file-row {
  width: 100%;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  padding: 2px var(--space-2);
  font-family: var(--font-mono);
  font-size: calc(var(--content-font-size) - 2px);
  line-height: 1.6;
  font-feature-settings: 'liga' 0, 'calt' 0;
  font-variant-ligatures: none;
  color: var(--color-text);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.file-row:hover {
  background: var(--color-hover);
  color: var(--color-accent);
}
.file-row:focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
</style>
