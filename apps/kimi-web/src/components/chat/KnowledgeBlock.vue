<!-- apps/kimi-web/src/components/chat/KnowledgeBlock.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Knowledge } from '../../types';
import Icon from '../ui/Icon.vue';

const { t } = useI18n();

const props = defineProps<{
  /** Knowledge entries that were recalled */
  items: Knowledge[];
  /** Whether this block is currently streaming */
  streaming?: boolean;
}>();

const emit = defineEmits<{
  /** Open the edit dialog for a specific knowledge entry */
  editKnowledge: [knowledge: Knowledge];
}>();

const expanded = ref(false);

function toggleExpand(): void {
  expanded.value = !expanded.value;
}

function formatContent(content: string): string {
  // Truncate to 100 chars when collapsed
  if (content.length <= 100) return content;
  return content.slice(0, 100) + '...';
}
</script>

<template>
  <div class="knowledge-block" :class="{ streaming }">
    <button
      type="button"
      class="kb-header"
      @click="toggleExpand"
    >
      <span class="kb-icon">
        <Icon name="bolt" size="sm" />
      </span>
      <span class="kb-label">
        {{ t('conversation.knowledge.recalled', { count: items.length }) }}
      </span>
      <Icon
        class="kb-chevron"
        :name="expanded ? 'chevron-down' : 'chevron-right'"
        size="sm"
      />
    </button>
    
    <div v-if="expanded" class="kb-items">
      <div
        v-for="item in items"
        :key="item.id"
        class="kb-item"
        @click="emit('editKnowledge', item)"
      >
        <span class="kb-item-name">{{ item.name }}</span>
        <span class="kb-item-preview">{{ formatContent(item.content) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0;
}

.kb-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: var(--ui-font-size-sm);
  text-align: left;
  width: 100%;
}

.kb-header:hover {
  color: var(--color-text);
}

.kb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.kb-label {
  flex: 1;
  font-weight: 500;
}

.kb-chevron {
  transition: transform 0.2s ease;
}

.kb-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 22px;
}

.kb-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.kb-item:hover {
  background: var(--color-surface-raised);
}

.kb-item-name {
  font-size: var(--ui-font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.kb-item-preview {
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Streaming state */
.knowledge-block.streaming .kb-header {
  opacity: 0.7;
  pointer-events: none;
}
</style>
