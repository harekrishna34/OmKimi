<!-- apps/kimi-web/src/components/chat/tool-calls/TodoTool.vue -->
<!-- Structured todo renderer (ported from the original bundle's TodoTool, scope
     data-v-461db4c2). Parses the `todos`/`items` array from the tool argument,
     renders a progress chip + bar in the trailing slot and one StatusGlyph row
     per entry in the body. Falls back to the raw output block when the
     argument carries no structured list. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { parseArg, str } from '../../../lib/toolMeta';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import Icon from '../../ui/Icon.vue';
import StatusGlyph, { type StatusGlyphStatus } from '../StatusGlyph.vue';

interface TodoEntry {
  title: string;
  status: 'pending' | 'in_progress' | 'done';
}

const props = withDefaults(
  defineProps<{
    tool: ToolCall;
    mobile?: boolean;
    stackPosition?: 'single' | 'first' | 'middle' | 'last';
    toolDiffPanel?: boolean;
  }>(),
  { mobile: false, stackPosition: 'single', toolDiffPanel: false },
);

defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
}>();

const { t } = useI18n();

/** Parse the tool argument into todo rows: `todos` array, falling back to
 *  `items`. Titles fall back across title/content/activeForm/text; statuses
 *  fold in_progress / done|completed / anything-else→pending. */
function parseTodos(arg: string): TodoEntry[] {
  const d = parseArg(arg);
  const list = d && Array.isArray(d.todos) ? d.todos : d && Array.isArray(d.items) ? d.items : undefined;
  if (!list) return [];
  const out: TodoEntry[] = [];
  for (const v of list) {
    if (!v || typeof v !== 'object') continue;
    const k = v as Record<string, unknown>;
    const title = str(k.title) ?? str(k.content) ?? str(k.activeForm) ?? str(k.text);
    if (!title) continue;
    const raw = str(k.status) ?? 'pending';
    const status: TodoEntry['status'] =
      raw === 'in_progress' ? 'in_progress' : raw === 'done' || raw === 'completed' ? 'done' : 'pending';
    out.push({ title, status });
  }
  return out;
}

const status = computed(() => props.tool.status);
const todos = computed<TodoEntry[]>(() => parseTodos(props.tool.arg));
const doneCount = computed(() => todos.value.filter((x) => x.status === 'done').length);
const total = computed(() => todos.value.length);
const current = computed(() => todos.value.find((x) => x.status === 'in_progress'));
const ratio = computed(() => (total.value > 0 ? doneCount.value / total.value : 0));
const hasOutput = computed(() => !!props.tool.output && props.tool.output.length > 0);
const expandable = computed(() => total.value > 0 || hasOutput.value);
const open = ref(props.tool.defaultExpanded === true && expandable.value);

watch(
  () => [props.tool.defaultExpanded, props.tool.status] as const,
  () => {
    if (props.tool.defaultExpanded === true && expandable.value) open.value = true;
  },
);

function glyphStatus(s: TodoEntry['status']): StatusGlyphStatus {
  return s === 'in_progress' ? 'run' : s;
}
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="open = !open">
    <template #leading>
      <Icon name="check-list" size="sm" />
    </template>
    <template #trailing>
      <span v-if="total > 0" class="tl-chip">{{ doneCount }}/{{ total }}</span>
      <span v-if="total > 0" class="todo-bar" aria-hidden="true">
        <span class="todo-fill" :style="{ width: `${ratio * 100}%` }" />
      </span>
    </template>
    <template #body>
      <div v-if="total > 0" class="todo-list">
        <div v-for="(td, i) in todos" :key="i" class="todo-row" :class="`s-${td.status}`">
          <StatusGlyph :status="glyphStatus(td.status)" />
          <span class="todo-title">{{ td.title }}</span>
        </div>
      </div>
      <ToolOutputBlock v-else-if="hasOutput" :lines="tool.output" />
    </template>
    <span class="tl-name">{{ t('tools.label.todo') }}</span>
    <span v-if="current" class="tl-dim">{{ current.title }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-461db4c2).
   --color-well → --color-surface-sunken. */
.todo-bar {
  display: inline-flex;
  width: 36px;
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--color-line);
  overflow: hidden;
  flex: none;
}
.todo-fill {
  background: var(--color-success);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 0.5px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  padding: var(--space-2) var(--space-3);
  max-height: calc(12 * 1.6 * var(--content-font-size));
  overflow-y: auto;
  overscroll-behavior: contain;
}
.todo-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 0;
  font-size: calc(var(--content-font-size) - 1px);
  color: var(--color-text);
}
.todo-title {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.todo-row.s-in_progress .todo-title {
  font-weight: var(--weight-medium);
}
.todo-row.s-done .todo-title {
  color: var(--color-text-faint);
  text-decoration: line-through;
}
</style>
