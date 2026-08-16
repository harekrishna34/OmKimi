<!-- apps/kimi-web/src/components/chat/tool-calls/GrepTool.vue -->
<!-- Grep/search tool row (ported from the original bundle's GrepTool, scope
     data-v-20effd60). Handles both `grep` (file matches as clickable rows) and
     `search` (web search → raw output block). Output lines of the form
     "path:line:text" become match rows that open the file. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { normalizeToolName, parseArg, str } from '../../../lib/toolMeta';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import Icon from '../../ui/Icon.vue';

interface Match {
  path?: string;
  line?: number;
  text: string;
}

const MATCH_LINE = /^(.+?):(\d+)[:-](.*)$/;

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
const isGrep = computed(() => normalizeToolName(props.tool.name) === 'grep');
const arg = computed(() => parseArg(props.tool.arg));
const pattern = computed(() => {
  const d = arg.value;
  return str(d?.pattern) ?? str(d?.query) ?? str(d?.regex) ?? '';
});
const path = computed(() => {
  const d = arg.value;
  return str(d?.path) ?? str(d?.glob) ?? str(d?.include) ?? '';
});
const matches = computed<Match[]>(() =>
  (props.tool.output ?? [])
    .filter((w) => w.trim().length > 0)
    .map((w) => {
      const m = MATCH_LINE.exec(w);
      return m ? { path: m[1], line: Number(m[2]), text: (m[3] ?? '').trim() } : { text: w };
    }),
);
const count = computed(() => matches.value.length);
const expandable = computed(() => count.value > 0);
const open = ref(props.tool.defaultExpanded === true && expandable.value);

watch(
  () => [props.tool.defaultExpanded, props.tool.output?.length, props.tool.status] as const,
  () => {
    if (props.tool.defaultExpanded === true && expandable.value) open.value = true;
  },
);

function openMatch(m: Match): void {
  if (m.path) emit('openFile', { path: m.path, line: m.line });
}
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="open = !open">
    <template #leading>
      <Icon name="search" size="sm" />
    </template>
    <template #trailing>
      <span v-if="count > 0" class="tl-chip">{{ t('tools.chip.results', { count }) }}</span>
    </template>
    <template #body>
      <div v-if="isGrep" class="match-list">
        <button
          v-for="(m, i) in matches"
          :key="i"
          class="match-row"
          :class="{ link: m.path }"
          type="button"
          @click="openMatch(m)"
        >
          <span v-if="m.path" class="mref">{{ m.path }}:{{ m.line }}</span>
          <span class="mtext">{{ m.text }}</span>
        </button>
      </div>
      <ToolOutputBlock v-else :lines="tool.output" />
    </template>
    <span class="tl-name">{{ t(isGrep ? 'tools.label.grep' : 'tools.label.search') }}</span>
    <span v-if="pattern" class="tl-mono">{{ pattern }}</span>
    <span v-else class="tl-dim">{{ tool.arg }}</span>
    <span v-if="path" class="tl-faint">{{ path }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-20effd60).
   --color-well → --color-surface-sunken. */
.match-list {
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
.match-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
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
  cursor: default;
}
.match-row.link {
  cursor: pointer;
}
.match-row.link:hover {
  background: var(--color-hover);
}
.match-row:focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
.mref {
  flex: none;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-faint);
}
.match-row.link:hover .mref {
  color: var(--color-accent);
}
.mtext {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
