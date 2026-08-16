<!-- apps/kimi-web/src/components/chat/tool-calls/ReadTool.vue -->
<!-- Read tool row (ported from the original bundle's ReadTool, scope
     data-v-8f838038). Collapsed: label + clickable basename + dir + line range.
     Expanded: full path link + numbered code (or raw output fallback). Output
     lines in the "1\tcontent" format become line-numbered code. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { filePath, num, parseArg } from '../../../lib/toolMeta';
import { basename, dirname } from '../../../lib/pathBasename';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import HighlightedCode from './HighlightedCode.vue';
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

const NUMBERED_LINE = /^(\d+)\t(.*)$/;

/** Parse "1\tcontent" output lines into numbered rows; null when any line
 *  breaks the format (ported from the original bundle's H7e). */
function parseNumberedOutput(output: string[]): { contents: string[]; lineNumbers: number[] } | null {
  const lines = output.at(-1) === '' ? output.slice(0, -1) : output;
  if (lines.length === 0) return null;
  const contents: string[] = [];
  const lineNumbers: number[] = [];
  for (const s of lines) {
    const m = NUMBERED_LINE.exec(s);
    if (!m) return null;
    lineNumbers.push(Number(m[1]));
    contents.push(m[2] ?? '');
  }
  return { contents, lineNumbers };
}

const status = computed(() => props.tool.status);
const arg = computed(() => parseArg(props.tool.arg));
const path = computed(() => (arg.value ? filePath(arg.value) : undefined) ?? '');
const base = computed(() => (path.value ? basename(path.value) : ''));
const dir = computed(() => (path.value ? dirname(path.value) : ''));
const start = computed(() => {
  const d = arg.value;
  return d ? num(d.offset) ?? num(d.line_start) ?? num(d.start_line) : undefined;
});
const end = computed(() => {
  const d = arg.value;
  if (!d) return undefined;
  const len = num(d.limit) ?? num(d.length);
  return num(d.line_end) ?? num(d.end_line) ?? (start.value !== undefined && len !== undefined ? start.value + len : undefined);
});
const range = computed(() =>
  start.value !== undefined && end.value !== undefined
    ? `:${start.value}-${end.value}`
    : start.value !== undefined
      ? `:${start.value}`
      : '',
);
const parsed = computed(() => (props.tool.status === 'ok' ? parseNumberedOutput(props.tool.output ?? []) : null));
const contents = computed(() => parsed.value?.contents ?? []);
const lineNumbers = computed(() => parsed.value?.lineNumbers);
const lineCount = computed(() => parsed.value?.contents.length ?? props.tool.output?.length ?? 0);
const hasOutput = computed(() => !!props.tool.output && props.tool.output.length > 0);
const expandable = computed(() => parsed.value !== null || hasOutput.value);
const open = ref(props.tool.defaultExpanded === true && expandable.value);
// Lazy-mount the numbered code view: only after the body has opened once.
const bodyReady = ref(open.value);
watch(open, (o) => {
  if (o) bodyReady.value = true;
});
watch(
  () => [props.tool.defaultExpanded, props.tool.output?.length, props.tool.status] as const,
  () => {
    if (props.tool.defaultExpanded === true && expandable.value) open.value = true;
  },
);

function openFileAt(): void {
  if (path.value) emit('openFile', { path: path.value, line: start.value });
}
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="open = !open">
    <template #leading>
      <Icon name="file-text" size="sm" />
    </template>
    <template #trailing>
      <span v-if="lineCount > 0" class="tl-chip">{{ t('tools.chip.lines', { count: lineCount }) }}</span>
    </template>
    <template #body>
      <button v-if="path" class="path-link" type="button" @click="openFileAt">{{ path }}</button>
      <HighlightedCode v-if="parsed && bodyReady" :code="contents" :path="path" :line-numbers="lineNumbers" />
      <ToolOutputBlock v-else :lines="tool.output" :empty-text="t('tools.output.waiting')" />
    </template>
    <span class="tl-name">{{ t('tools.label.read') }}</span>
    <button v-if="base" class="tl-file" type="button" @click.stop="openFileAt">{{ base }}</button>
    <span v-if="dir" class="tl-faint">{{ dir }}</span>
    <span v-if="range" class="tl-faint">{{ range }}</span>
    <span v-if="!base" class="tl-dim">{{ path || tool.arg }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-8f838038). */
.path-link {
  display: block;
  width: 100%;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  padding: 0 0 var(--space-1);
  font-family: var(--font-mono);
  font-size: calc(var(--content-font-size) - 2px);
  color: var(--color-text-muted);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.path-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.path-link:focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
</style>
