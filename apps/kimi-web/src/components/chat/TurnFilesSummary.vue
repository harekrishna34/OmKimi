<!-- apps/kimi-web/src/components/chat/TurnFilesSummary.vue -->
<!-- "N files changed" summary block rendered at the end of an assistant turn.
     Ported from the original bundle (scope data-v-4faa5c71): pencil icon +
     title + total +/- with a mini diff bar in the card head; file rows with
     dimmed dir + base name and per-file counts; collapsed to the first 3
     files with a "N more files" foot toggle. Clicking a file opens the diff
     panel (edit) or the file preview (write). -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TurnFileChange } from '../../lib/turnFiles';
import { relativizePath } from '../../lib/turnFiles';
import { basename as pathBasename } from '../../lib/pathBasename';
import Card from '../ui/Card.vue';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    changes: TurnFileChange[];
    cwd?: string;
    interactive?: boolean;
  }>(),
  { cwd: undefined, interactive: true },
);

const emit = defineEmits<{
  openDiff: [change: TurnFileChange];
  openFile: [target: { path: string }];
}>();

const { t } = useI18n();

const COLLAPSED_LIMIT = 3;

const isInteractive = computed(() => props.interactive !== false);
const title = computed(() => {
  const n = props.changes.length;
  return t(n === 1 ? 'conversation.turnFiles.titleOne' : 'conversation.turnFiles.titleOther', { number: n });
});
const statsIncomplete = computed(() => props.changes.some((c) => c.statsIncomplete));
const totals = computed(() => {
  let added = 0;
  let removed = 0;
  for (const c of props.changes) {
    added += c.added;
    removed += c.removed;
  }
  return { added, removed };
});
const showTotals = computed(() => !statsIncomplete.value && (totals.value.added > 0 || totals.value.removed > 0));

const expanded = ref(false);
const visibleChanges = computed(() => (expanded.value ? props.changes : props.changes.slice(0, COLLAPSED_LIMIT)));
const hiddenCount = computed(() => Math.max(0, props.changes.length - COLLAPSED_LIMIT));
const hasMore = computed(() => props.changes.length > COLLAPSED_LIMIT);
const moreLabel = computed(() => {
  if (expanded.value) return t('conversation.turnFiles.showLess');
  return hiddenCount.value === 1
    ? t('conversation.turnFiles.moreOne')
    : t('conversation.turnFiles.more', { number: hiddenCount.value });
});

/** Display path: relativized against cwd when inside it (empty → basename). */
function displayPath(path: string): string {
  if (!props.cwd) return path;
  const rel = relativizePath(path, props.cwd);
  if (rel !== null) return rel || pathBasename(path);
  return path;
}

function dirOf(display: string): string {
  const i = Math.max(display.lastIndexOf('/'), display.lastIndexOf('\\'));
  return i > 0 ? display.slice(0, i + 1) : '';
}

function baseOf(display: string): string {
  const i = Math.max(display.lastIndexOf('/'), display.lastIndexOf('\\'));
  return i >= 0 ? display.slice(i + 1) : display;
}

function perFileStats(change: TurnFileChange): { added: number; removed: number } | null {
  return change.statsIncomplete || (change.added === 0 && change.removed === 0)
    ? null
    : { added: change.added, removed: change.removed };
}

function openChange(change: TurnFileChange): void {
  if (change.hasWrite) emit('openFile', { path: change.path });
  else emit('openDiff', change);
}
</script>

<template>
  <div v-if="changes.length > 0" class="turn-files">
    <Card>
      <template #head>
        <span class="tf-ic" aria-hidden="true">
          <Icon name="pencil" size="sm" />
        </span>
        <span class="tf-title">{{ title }}</span>
        <span v-if="showTotals" class="tf-stats">
          <span v-if="totals.added > 0" class="tf-add">+{{ totals.added }}</span>
          <span v-if="totals.removed > 0" class="tf-del">−{{ totals.removed }}</span>
          <span class="diffbar" aria-hidden="true">
            <span class="seg-add" :style="{ flexGrow: totals.added }" />
            <span class="seg-del" :style="{ flexGrow: totals.removed }" />
          </span>
        </span>
      </template>

      <ul class="tf-list">
        <li v-for="change in visibleChanges" :key="change.path" class="tf-row">
          <component
            :is="isInteractive ? 'button' : 'span'"
            class="tf-file"
            :type="isInteractive ? 'button' : undefined"
            @click="isInteractive && openChange(change)"
          >
            <span v-if="dirOf(displayPath(change.path))" class="tf-dir">{{ dirOf(displayPath(change.path)) }}</span>
            <span class="tf-base">{{ baseOf(displayPath(change.path)) }}</span>
          </component>
          <span v-if="perFileStats(change)" class="tf-stats">
            <span v-if="perFileStats(change)!.added > 0" class="tf-add">+{{ perFileStats(change)!.added }}</span>
            <span v-if="perFileStats(change)!.removed > 0" class="tf-del">−{{ perFileStats(change)!.removed }}</span>
          </span>
        </li>
      </ul>

      <template v-if="hasMore" #foot>
        <button
          type="button"
          class="tf-more ui-button ui-button--ghost ui-button--sm"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ moreLabel }}
          <Icon class="tf-more-car" :class="{ open: expanded }" name="chevron-down" size="sm" aria-hidden="true" />
        </button>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.turn-files {
  margin-top: var(--chat-block-gap);
}
.turn-files :deep(.ui-card__head) {
  font-family: var(--font-ui);
  font-weight: var(--weight-regular);
  padding: var(--space-2) var(--space-3);
}
.turn-files :deep(.ui-card__body) {
  padding: var(--space-1) var(--space-3);
}
.turn-files :deep(.ui-card__foot) {
  padding: 0;
  justify-content: stretch;
}
.tf-ic {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-faint);
  flex: none;
}
.tf-title {
  font-size: var(--text-sm);
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tf-stats {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  flex: none;
}
.tf-add,
.tf-del {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  flex: none;
}
.tf-add { color: var(--color-success); }
.tf-del { color: var(--color-danger); }
.tf-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.tf-row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
}
.tf-file {
  display: flex;
  align-items: baseline;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
}
button.tf-file { cursor: pointer; }
button.tf-file:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-text-faint);
  text-underline-offset: 3px;
}
.tf-file:focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
.tf-dir {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-faint);
}
.tf-base {
  flex: none;
  font-weight: var(--weight-medium);
  color: var(--color-text);
}
.tf-more {
  width: 100%;
  justify-content: flex-start;
  border-radius: 0;
}
.tf-more-car {
  color: var(--color-text-faint);
  transition: transform var(--duration-base) var(--ease-out);
}
.tf-more-car.open { transform: rotate(180deg); }
.diffbar {
  display: inline-flex;
  width: 36px;
  height: 3px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex: none;
}
.seg-add { background: var(--color-success); }
.seg-del { background: var(--color-danger); }
</style>
