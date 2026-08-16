<!-- apps/kimi-web/src/components/chat/KnowledgeEditDialog.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Knowledge, KnowledgeFormData } from '../../types';
import Icon from '../ui/Icon.vue';

const { t } = useI18n();

const props = defineProps<{
  /** Whether the dialog is visible */
  visible: boolean;
  /** Knowledge to edit (null for create mode) */
  knowledge?: Knowledge | null;
}>();

const emit = defineEmits<{
  /** Close the dialog */
  close: [];
  /** Save the knowledge (create or update) */
  save: [data: KnowledgeFormData, id?: string];
  /** Delete the knowledge */
  delete: [id: string];
}>();

// Form state
const formData = ref<KnowledgeFormData>({
  name: '',
  useWhen: '',
  content: '',
  tags: [],
});

const isEditing = computed(() => !!props.knowledge);
const charCount = computed(() => formData.value.content.length);
const isValid = computed(() => 
  formData.value.name.trim().length > 0 && 
  formData.value.content.trim().length > 0 &&
  formData.value.content.length <= 2000
);

// Watch for knowledge prop changes to populate form
watch(() => props.knowledge, (newKnowledge) => {
  if (newKnowledge) {
    formData.value = {
      name: newKnowledge.name,
      useWhen: newKnowledge.useWhen,
      content: newKnowledge.content,
      tags: newKnowledge.tags || [],
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Watch for visible prop to reset form when opening
watch(() => props.visible, (isVisible) => {
  if (isVisible && !props.knowledge) {
    resetForm();
  }
});

function resetForm(): void {
  formData.value = {
    name: '',
    useWhen: '',
    content: '',
    tags: [],
  };
}

function handleSave(): void {
  if (!isValid.value) return;
  emit('save', { ...formData.value }, props.knowledge?.id);
}

function handleDelete(): void {
  if (props.knowledge?.id) {
    emit('delete', props.knowledge.id);
  }
}

function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    emit('close');
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="knowledge-dialog">
      <div
        v-if="visible"
        class="knowledge-overlay"
        @click="handleBackdropClick"
        @keydown="handleKeyDown"
      >
        <div class="knowledge-dialog" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="kd-header">
            <h2 class="kd-title">
              {{ isEditing ? t('knowledge.editTitle') : t('knowledge.createTitle') }}
            </h2>
            <button
              type="button"
              class="kd-close"
              :aria-label="t('knowledge.close')"
              @click="emit('close')"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>

          <!-- Form -->
          <div class="kd-body">
            <!-- Name field -->
            <div class="kd-field">
              <label class="kd-label" for="knowledge-name">
                {{ t('knowledge.name') }}
              </label>
              <div class="kd-input-wrap">
                <input
                  id="knowledge-name"
                  v-model="formData.name"
                  type="text"
                  class="kd-input"
                  :placeholder="t('knowledge.namePlaceholder')"
                  maxlength="100"
                />
                <button
                  v-if="formData.name"
                  type="button"
                  class="kd-input-clear"
                  @click="formData.name = ''"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            </div>

            <!-- Use When field -->
            <div class="kd-field">
              <label class="kd-label" for="knowledge-usewhen">
                {{ t('knowledge.useWhen') }}
              </label>
              <input
                id="knowledge-usewhen"
                v-model="formData.useWhen"
                type="text"
                class="kd-input"
                :placeholder="t('knowledge.useWhenPlaceholder')"
              />
            </div>

            <!-- Content field -->
            <div class="kd-field">
              <label class="kd-label" for="knowledge-content">
                {{ t('knowledge.content') }}
              </label>
              <textarea
                id="knowledge-content"
                v-model="formData.content"
                class="kd-textarea"
                :placeholder="t('knowledge.contentPlaceholder')"
                rows="6"
                maxlength="2000"
              />
              <div class="kd-char-count" :class="{ 'over-limit': charCount > 2000 }">
                {{ charCount }} / 2000
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="kd-footer">
            <button
              v-if="isEditing"
              type="button"
              class="kd-btn kd-btn-delete"
              @click="handleDelete"
            >
              {{ t('knowledge.delete') }}
            </button>
            <div class="kd-footer-right">
              <button
                type="button"
                class="kd-btn kd-btn-cancel"
                @click="emit('close')"
              >
                {{ t('knowledge.cancel') }}
              </button>
              <button
                type="button"
                class="kd-btn kd-btn-save"
                :disabled="!isValid"
                @click="handleSave"
              >
                {{ t('knowledge.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.knowledge-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Dialog */
.knowledge-dialog {
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.kd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.kd-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.kd-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.kd-close:hover {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

/* Body */
.kd-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Field */
.kd-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kd-label {
  font-size: var(--ui-font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

/* Input wrapper */
.kd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.kd-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--ui-font-size);
  outline: none;
  transition: border-color 0.15s ease;
}

.kd-input:focus {
  border-color: var(--color-accent);
}

.kd-input-clear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--color-surface);
  border: none;
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.kd-input-clear:hover {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

/* Textarea */
.kd-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--ui-font-size);
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  outline: none;
  transition: border-color 0.15s ease;
}

.kd-textarea:focus {
  border-color: var(--color-accent);
}

/* Character count */
.kd-char-count {
  align-self: flex-end;
  font-size: var(--ui-font-size-xs);
  color: var(--color-text-muted);
}

.kd-char-count.over-limit {
  color: var(--color-danger);
}

/* Footer */
.kd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--color-line);
}

.kd-footer-right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

/* Buttons */
.kd-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--ui-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.kd-btn-delete {
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.kd-btn-delete:hover {
  background: var(--color-danger-soft);
}

.kd-btn-cancel {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

.kd-btn-cancel:hover {
  background: var(--color-surface-sunken);
}

.kd-btn-save {
  background: var(--color-text);
  color: var(--color-surface);
}

.kd-btn-save:hover:not(:disabled) {
  opacity: 0.9;
}

.kd-btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.knowledge-dialog-enter-active,
.knowledge-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.knowledge-dialog-enter-active .knowledge-dialog,
.knowledge-dialog-leave-active .knowledge-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.knowledge-dialog-enter-from,
.knowledge-dialog-leave-to {
  opacity: 0;
}

.knowledge-dialog-enter-from .knowledge-dialog,
.knowledge-dialog-leave-to .knowledge-dialog {
  transform: scale(0.95);
  opacity: 0;
}

/* Mobile */
@media (max-width: 480px) {
  .knowledge-dialog {
    width: 95%;
    max-height: 85vh;
  }
  
  .kd-header,
  .kd-body,
  .kd-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
