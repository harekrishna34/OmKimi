<!-- apps/kimi-web/src/components/chat/tool-calls/TodoTool.vue -->
<!-- Clean in-transcript renderer for the model's TodoList tool. The backend
     emits plain text (`[done] Title` lines); instead of dumping that raw text
     we parse the structured `todos` array from the tool call argument (falling
     back to parsing the output lines) and render a checkmark card with a
     progress header — matching the original Manus-style todo UI. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { toolGlyph, toolLabel } from '../../../lib/toolMeta';
import ToolRow from '../ToolRow.vue';
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
}>();

const { t } = useI18n();

/** Parse the tool call argument JSON into a todos array. */
function parseArgTodos(arg: string): TodoEntry[] | undefined {
  try {
    const d = JSON.parse(arg);
    if (Array.isArray(d?.todos)) {
      const list = d.todos as Array<{ title?: unknown; status?: unknown }>;
      const parsed: TodoEntry[] = [];
      for (const x of list) {
        if (!x || typeof x !== 'object') continue;
        const title = typeof x.title === 'string' ? x.title.trim() : '';
        if (title.length === 0) continue;
        const status: TodoEntry['status'] =
          x.status === 'in_progress' || x.status === 'done' || x.status === 'pending'
            ? x.status
            : 'pending';
        parsed.push({ title, status });
      }
      return parsed;
    }
  } catch {
    /* fall through to output parsing */
  }
  return undefined;
}

/** Parse the tool's text output (`[done] Title` lines) into a todos array. */
function parseOutputTodos(lines?: string[]): TodoEntry[] {
  const out: TodoEntry[] = [];
  for (const line of lines ?? []) {
    const m = line.trim().match(/^\[(pending|in_progress|done)\]\s+(.+)$/);
    if (m && m[1] && m[2]) {
      out.push({ status: m[1] as TodoEntry['status'], title: m[2].trim() });
    }
  }
  return out;
}

const todos = computed<TodoEntry[]>(() => {
  const fromArg = parseArgTodos(props.tool.arg);
  if (fromArg !== undefined) return fromArg;
  return parseOutputTodos(props.tool.output);
});

const total = computed(() => todos.value.length);
const done = computed(() => todos.value.filter((x) => x.status === 'done').length);
const inProgress = computed(() => todos.value.filter((x) => x.status === 'in_progress').length);
const progressPct = computed(() => (total.value === 0 ? 0 : Math.round((done.value / total.value) * 100)));

const status = computed<'running' | 'ok' | 'error'>(() => props.tool.status as 'running' | 'ok' | 'error');
const label = computed(() => toolLabel(props.tool.name));
const glyph = computed(() => toolGlyph(props.tool.name));

// Empty query (no todos in arg, none in output): nothing worth a card.
const isEmpty = computed(() => total.value === 0);
const open = ref(!isEmpty.value);
watch(isEmpty, (empty) => {
  if (!empty) open.value = true;
});

function glyphStatus(s: TodoEntry['status']): StatusGlyphStatus {
  return s === 'in_progress' ? 'run' : s;
}
</script>

<template>
  <ToolRow
    :status="status"
    :icon="glyph"
    :name="label"
    :arg="''"
    :time="tool.timing ?? ''"
    :open="open"
    :expandable="!isEmpty"
    :stacked="stackPosition !== 'single'"
    :stack-position="stackPosition"
    @toggle="open = !open"
  >
    <template #trailing>
      <span v-if="total > 0" class="todo-chip">{{ done }}/{{ total }}</span>
    </template>

    <div v-if="isEmpty" class="todo-empty">{{ t('tasks.emptyTodo') }}</div>

    <div v-else class="todo-body">
      <div class="todo-progress">
        <div class="todo-progress-bar">
          <div class="todo-progress-fill" :style="{ width: `${progressPct}%` }" />
        </div>
        <span class="todo-progress-label">
          {{ t('tasks.todoProgress', { done, total, inProgress }) }}
        </span>
      </div>
      <div class="todo-rows">
        <div
          v-for="(td, i) in todos"
          :key="i"
          class="todo-row"
          :class="`s-${td.status}`"
        >
          <StatusGlyph :status="glyphStatus(td.status)" />
          <span class="todo-title">{{ td.title }}</span>
        </div>
      </div>
    </div>
  </ToolRow>
</template>

<style scoped>
.todo-chip {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  flex: none;
}

.todo-empty {
  color: var(--color-text-faint);
  font-style: italic;
  font-size: var(--text-sm);
  padding: var(--space-1) 0;
}

.todo-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-1) 0 var(--space-1);
}

.todo-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.todo-progress-bar {
  flex: none;
  width: 120px;
  height: 5px;
  border-radius: 999px;
  background: var(--color-surface-sunken);
  overflow: hidden;
}

.todo-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-success);
  transition: width var(--duration-base) var(--ease-out);
}

.todo-progress-label {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.todo-rows {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.todo-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
  color: var(--color-text);
  font-size: var(--text-sm);
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
