<!-- apps/kimi-web/src/components/chat/ThinkingBlock.vue -->
<!-- Inline expandable thinking block matching the original Railway UI:
     .think > .think-head (bulb + title + time + chevron) + .think-body (grid collapse).
     While streaming the title breathes and the body stays open. -->
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    text: string;
    mobile?: boolean;
    streaming?: boolean;
    /** Duration label, e.g. "14s". Shown next to the title when not streaming. */
    time?: string;
  }>(),
  { mobile: false, streaming: false, time: '' },
);

const { t } = useI18n();
const open = ref(props.streaming);
const bodyEl = ref<HTMLElement | null>(null);

function toggle(): void {
  if (props.streaming) return;
  open.value = !open.value;
}

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
    <button class="think-head" type="button" :aria-expanded="open" @click="toggle">
      <span class="think-bulb" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.3 1.5-3.5A6 6 0 0 0 6 8c0 1.2.5 2.4 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      </span>
      <span class="think-title">{{ t('thinking.panelTitle') }}</span>
      <span v-if="time && !streaming" class="think-time">{{ time }}</span>
      <Icon class="think-car" name="chevron-right" size="sm" />
    </button>
    <div class="think-body" :class="{ open, instant: !streaming }" :inert="!open">
      <div class="think-body-inner">
        <pre ref="bodyEl" class="think-text">{{ text }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.think {
  margin: 0;
}

.think-head {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-1) 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-faint);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  line-height: 1;
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: color var(--duration-base) var(--ease-out);
}
.think-head:hover {
  color: var(--color-text);
}
.think-head:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-soft);
}

.think-bulb {
  flex: none;
  display: inline-flex;
  align-items: center;
}

.think-title {
  font-weight: var(--weight-medium);
}

.think-time {
  color: var(--color-text-faint);
  font-weight: 400;
  flex: none;
}

.think.streaming .think-title {
  animation: think-breathe 1.6s var(--ease-in-out) infinite;
}
@keyframes think-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.think-car {
  color: var(--color-text-faint);
  flex: none;
  transition: transform var(--duration-base) var(--ease-out);
}
.think.open .think-car {
  transform: rotate(90deg);
}

.think-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.think-body.instant {
  transition: none;
}
.think-body.open {
  grid-template-rows: minmax(0, 1fr);
}

.think-body-inner {
  min-height: 0;
  overflow: hidden;
}

.think-text {
  margin: 0;
  padding: 0;
  font: var(--text-base)/var(--leading-relaxed) var(--font-ui);
  font-weight: 425;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: calc(var(--leading-relaxed) * 1em * 5);
  overflow-y: auto;
}

/* Streaming: keep open, disable toggle. */
.think.streaming .think-head {
  cursor: default;
}
.think.streaming .think-car {
  animation: none;
  transform: rotate(90deg);
}

/* Mobile tweaks */
.mob .think-text {
  color: var(--color-text-faint);
  line-height: var(--leading-normal);
  max-height: calc(var(--leading-normal) * 1em * 5);
}
</style>
