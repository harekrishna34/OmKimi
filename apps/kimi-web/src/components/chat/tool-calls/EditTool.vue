<!-- apps/kimi-web/src/components/chat/tool-calls/EditTool.vue -->
<!-- Edit/write tool row (ported from the original bundle's EditTool, scope
     data-v-1837df11). Edit/multi_edit show +/− counts and a proportional
     diffbar, with the line diff in the body; write shows a "created" chip and
     the written content. Falls back to the raw output block when no diff can
     be derived from the arguments. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { diffStats } from '../../../lib/diffLines';
import { buildEditDiffLines } from '../../../lib/toolDiff';
import { basename, dirname } from '../../../lib/pathBasename';
import { filePath, normalizeToolName, parseArg } from '../../../lib/toolMeta';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import HighlightedCode from './HighlightedCode.vue';
import Icon from '../../ui/Icon.vue';
import { useI18n } from 'vue-i18n';

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

/** Cap for write content previews, ported from the original bundle (I1/u6e). */
const MAX_WRITE_CHARS = 100 * 1024;
const MAX_WRITE_LINES = 5000;

interface WriteContent {
  content: string;
  path?: string;
}

/** Parse the written content out of a `write` tool call's argument, or null
 *  when the content is absent / too large to preview. */
function parseWriteContent(tool: ToolCall): WriteContent | null {
  if (normalizeToolName(tool.name) !== 'write') return null;
  const d = parseArg(tool.arg);
  if (!d || typeof d.content !== 'string') return null;
  const content = d.content;
  if (content.length > MAX_WRITE_CHARS || content.split('\n').length > MAX_WRITE_LINES) return null;
  return { content, path: filePath(d) };
}

const status = computed(() => props.tool.status);
const isWrite = computed(() => normalizeToolName(props.tool.name) === 'write');
const path = computed(() => {
  const d = parseArg(props.tool.arg);
  return (d ? filePath(d) : undefined) ?? '';
});
const base = computed(() => (path.value ? basename(path.value) : ''));
const dir = computed(() => (path.value ? dirname(path.value) : ''));
const diffLines = computed(() => buildEditDiffLines(props.tool));
const writeContent = computed(() => parseWriteContent(props.tool));
const stats = computed(() => {
  const d = diffLines.value;
  return !d || props.tool.status === 'error' ? { added: 0, removed: 0 } : diffStats(d);
});
const hasStats = computed(() => stats.value.added > 0 || stats.value.removed > 0);
const hasOutput = computed(() => !!props.tool.output && props.tool.output.length > 0);
const showDiff = computed(() => diffLines.value !== null && props.tool.status !== 'error');
const showWrite = computed(() => writeContent.value !== null && props.tool.status !== 'error');
const expandable = computed(() => showDiff.value || showWrite.value || hasOutput.value);
const open = ref(false);
// Lazy-mount the diff/code view: only after the body has opened once.
const bodyReady = ref(false);
watch(open, (o) => {
  if (o) bodyReady.value = true;
});

function toggle(): void {
  if (props.toolDiffPanel) {
    emit('openToolDiff', props.tool.id);
    return;
  }
  if (expandable.value) open.value = !open.value;
}

function openPath(): void {
  if (path.value) emit('openFile', { path: path.value });
}
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="toggle">
    <template #leading>
      <Icon :name="isWrite ? 'file-plus' : 'pencil'" size="sm" />
    </template>
    <template #trailing>
      <template v-if="hasStats">
        <span v-if="stats.added > 0" class="tl-add">+{{ stats.added }}</span>
        <span v-if="stats.removed > 0" class="tl-del">−{{ stats.removed }}</span>
        <span class="diffbar" aria-hidden="true">
          <span class="seg-add" :style="{ flexGrow: stats.added }" />
          <span class="seg-del" :style="{ flexGrow: stats.removed }" />
        </span>
      </template>
      <span v-else-if="isWrite && status === 'ok'" class="tl-chip">{{ t('tools.chip.created') }}</span>
    </template>
    <template #body>
      <HighlightedCode v-if="showDiff && bodyReady" :lines="diffLines ?? []" :path="path" />
      <HighlightedCode
        v-else-if="showWrite && bodyReady"
        :code="writeContent?.content ?? ''"
        :path="writeContent?.path"
      />
      <ToolOutputBlock v-else :lines="tool.output" :empty-text="t('tools.output.waiting')" />
    </template>
    <span class="tl-name">{{ t(isWrite ? 'tools.label.write' : 'tools.label.edit') }}</span>
    <button v-if="base" class="tl-file" type="button" @click.stop="openPath">{{ base }}</button>
    <span v-else class="tl-dim">{{ path || tool.arg }}</span>
    <span v-if="dir" class="tl-faint">{{ dir }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-1837df11). */
.diffbar {
  display: inline-flex;
  width: 36px;
  height: 3px;
  border-radius: var(--radius-full);
  overflow: hidden;
  gap: 1px;
  flex: none;
}
.seg-add {
  background: var(--color-success);
}
.seg-del {
  background: var(--color-danger);
}
</style>
