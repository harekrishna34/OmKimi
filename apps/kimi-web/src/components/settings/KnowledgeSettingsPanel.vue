<!-- apps/kimi-web/src/components/settings/KnowledgeSettingsPanel.vue -->
<!-- Knowledge management panel: lists all knowledge entries with add/edit/delete.
     Mirrors the Manus knowledge system: Name + Use-when + Content (2000 chars). -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useKnowledge } from '../../composables/useKnowledge';
import type { Knowledge, KnowledgeFormData } from '../../types';
import KnowledgeEditDialog from '../chat/KnowledgeEditDialog.vue';
import Icon from '../ui/Icon.vue';
import Button from '../ui/Button.vue';
import { useConfirmDialog } from '../../composables/useConfirmDialog';

const { t } = useI18n();
const { confirm } = useConfirmDialog();

const {
  allEntries,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  toggleKnowledge,
  importKnowledge,
  exportKnowledge,
} = useKnowledge();

const dialogVisible = ref(false);
const editingKnowledge = ref<Knowledge | null>(null);
const searchQuery = ref('');

const filteredEntries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return allEntries.value;
  return allEntries.value.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.useWhen.toLowerCase().includes(q),
  );
});

function openCreate(): void {
  editingKnowledge.value = null;
  dialogVisible.value = true;
}

function openEdit(knowledge: Knowledge): void {
  editingKnowledge.value = knowledge;
  dialogVisible.value = true;
}

function handleSave(data: KnowledgeFormData, id?: string): void {
  if (id) {
    updateKnowledge(id, data);
  } else {
    createKnowledge(data);
  }
  dialogVisible.value = false;
}

async function handleDelete(id: string): Promise<void> {
  const entry = allEntries.value.find((e) => e.id === id);
  if (!entry) return;
  const ok = await confirm({
    title: t('knowledge.confirm.deleteTitle'),
    message: t('knowledge.confirm.deleteMessage', { name: entry.name }),
    variant: 'danger',
  });
  if (ok) {
    deleteKnowledge(id);
    dialogVisible.value = false;
  }
}

function handleImport(): void {
  // Hidden file input for JSON import
  fileInput.value?.click();
}

const fileInput = ref<HTMLInputElement | null>(null);

function onImportFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result ?? '');
    if (importKnowledge(text)) {
      input.value = '';
    }
  };
  reader.readAsText(file);
}

function handleExport(): void {
  const json = exportKnowledge();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omkimi-knowledge-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div class="knowledge-panel">
    <div class="kp-header">
      <div class="kp-header-text">
        <h3 class="kp-title">{{ t('knowledge.settings.title') }}</h3>
        <p class="kp-desc">{{ t('knowledge.settings.description') }}</p>
      </div>
      <div class="kp-actions">
        <Button variant="ghost" size="sm" @click="handleImport">
          {{ t('knowledge.settings.import') }}
        </Button>
        <Button variant="ghost" size="sm" @click="handleExport">
          {{ t('knowledge.settings.export') }}
        </Button>
        <Button variant="primary" size="sm" @click="openCreate">
          {{ t('knowledge.settings.addNew') }}
        </Button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="kp-file-input"
        @change="onImportFile"
      />
    </div>

    <!-- Search + count -->
    <div v-if="allEntries.length > 0" class="kp-toolbar">
      <input
        v-model="searchQuery"
        type="text"
        class="kp-search"
        :placeholder="t('knowledge.namePlaceholder')"
      />
      <span class="kp-count">{{ t('knowledge.settings.totalEntries', { count: allEntries.length }) }}</span>
    </div>

    <!-- Entry list -->
    <div v-if="filteredEntries.length > 0" class="kp-list">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="kp-entry"
        :class="{ inactive: !entry.active }"
        @click="openEdit(entry)"
      >
        <div class="kp-entry-main">
          <div class="kp-entry-name">
            <span class="kp-entry-dot" :class="{ on: entry.active }" />
            <span>{{ entry.name }}</span>
          </div>
          <div v-if="entry.useWhen" class="kp-entry-when">{{ entry.useWhen }}</div>
          <div class="kp-entry-preview">{{ entry.content.slice(0, 80) }}{{ entry.content.length > 80 ? '…' : '' }}</div>
        </div>
        <div class="kp-entry-meta">
          <span class="kp-entry-date">{{ formatDate(entry.updatedAt) }}</span>
          <button
            type="button"
            class="kp-entry-toggle"
            :title="entry.active ? t('knowledge.confirm.deleteTitle') : ''"
            @click.stop="toggleKnowledge(entry.id)"
          >
            <Icon name="check" size="sm" v-if="entry.active" />
            <Icon name="close" size="sm" v-else />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="kp-empty">
      <Icon name="bolt" size="lg" />
      <p class="kp-empty-text">{{ t('knowledge.settings.empty') }}</p>
      <p class="kp-empty-hint">{{ t('knowledge.settings.emptyHint') }}</p>
    </div>

    <!-- Edit dialog -->
    <KnowledgeEditDialog
      :visible="dialogVisible"
      :knowledge="editingKnowledge"
      @close="dialogVisible = false"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped>
.knowledge-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.kp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.kp-header-text {
  flex: 1;
  min-width: 200px;
}

.kp-title {
  margin: 0 0 4px;
  font-size: var(--ui-font-size);
  font-weight: 600;
  color: var(--color-text);
}

.kp-desc {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.kp-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.kp-file-input {
  display: none;
}

.kp-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kp-search {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--ui-font-size-sm);
  outline: none;
}

.kp-search:focus {
  border-color: var(--color-accent);
}

.kp-count {
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.kp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kp-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.kp-entry:hover {
  border-color: var(--color-accent);
}

.kp-entry.inactive {
  opacity: 0.55;
}

.kp-entry-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kp-entry-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ui-font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.kp-entry-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-muted);
  flex-shrink: 0;
}

.kp-entry-dot.on {
  background: var(--color-success, #22c55e);
}

.kp-entry-when {
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
}

.kp-entry-preview {
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kp-entry-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.kp-entry-date {
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
}

.kp-entry-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.kp-entry-toggle:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.kp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  color: var(--color-text-muted);
  text-align: center;
}

.kp-empty-text {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--color-text);
}

.kp-empty-hint {
  margin: 0;
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
  max-width: 320px;
}
</style>
