<!-- apps/kimi-web/src/components/chat/ThinkingBlock.vue -->
<!-- Inline expandable thinking block: header shows a lightbulb + "Thinking" +
     chevron; body expands/collapses in place. While streaming the block stays
     open and scrolls to the latest line. -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    text: string;
    mobile?: boolean;
    streaming?: boolean;
  }>(),
  { mobile: false, streaming: false },
);

const { t } = useI18n();
const open = ref(props.streaming);
const bodyEl = ref<HTMLElement | null>(null);

function toggle(): void {
  if (props.streaming) return;
  open.value = !open.value;
}

const lightbulbIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.3 1.5-3.5A6 6 0 0 0 6 8c0 1.2.5 2.4 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;

function scrollToBottom(): void {
  const el = bodyEl.value;
  if (el) el.scrollTop = el.scrollHeight;
}

onMounted(() => {
  if (props.streaming) scrollToBottom();
});

watch(
  () => props.text,
  () => {
    if (props.streaming && open.value) {
      void nextTick(scrollToBottom);
    }
  },
);
</script>

<template>
  <div class="think" :class="{ mob: mobile, open, streaming }">
    <button class="tb-head" type="button" :aria-expanded="open" @click="toggle">
      <span class="tb-icon" v-html="lightbulbIcon" aria-hidden="true" />
      <span class="tb-title">{{ t('thinking.panelTitle') }}</span>
      <Icon class="tb-car" name="chevron-right" size="sm" />
    </button>
    <div class="tb-body" :class="{ open }" :inert="!open">
      <pre ref="bodyEl" class="tc">{{ text }}</pre>
    </div>
  </div>
</template>

<style scoped>
.think {
  display: flex;
  flex-direction: column;
}

.tb-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  height: 28px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-muted);
  font: var(--text-sm)/1 var(--font-ui);
  font-weight: var(--weight-medium);
  cursor: pointer;
  user-select: none;
  transition: color 0.12s ease;
}
.tb-head:hover {
  color: var(--color-text);
}
.tb-head:focus-visible {
  outline: none;
  box-shadow: none;
}

.tb-icon {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-faint);
  flex: none;
}
.tb-title {
  flex: none;
}
.tb-car {
  color: var(--color-text-faint);
  flex: none;
  transition: transform var(--duration-base) var(--ease-out);
}
.think.open .tb-car {
  transform: rotate(90deg);
}

.tb-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.tb-body.open {
  grid-template-rows: minmax(0, 1fr);
}

.tc {
  min-height: 0;
  overflow: hidden;
  margin: 6px 0 0;
  padding: 0;
  font: var(--text-base)/var(--leading-relaxed) var(--font-ui);
  font-weight: 425;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: calc(var(--leading-relaxed) * 1em * 5);
  overflow-y: auto;
}

/* Streaming: keep open, mute hover color, pin to bottom. */
.think.streaming .tb-head {
  cursor: default;
}
.think.streaming .tb-car {
  animation: none;
  transform: rotate(90deg);
}

/* Mobile tweaks */
.mob .tc {
  color: var(--color-text-faint);
  line-height: var(--leading-normal);
  max-height: calc(var(--leading-normal) * 1em * 5);
}
</style>
