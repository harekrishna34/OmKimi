<!-- apps/kimi-web/src/components/chat/ThinkingBlock.vue -->
<!-- Inline expandable thinking block matching the original Railway UI:
     .think > .think-head (bulb + title + time + chevron) + .think-body (grid collapse).
     Starts collapsed; the head always toggles (even while streaming). While
     streaming the title breathes and shows a live elapsed tick; once settled it
     shows the measured duration. -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatElapsed } from '../chatTurnRendering';
import Icon from '../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    text: string;
    mobile?: boolean;
    streaming?: boolean;
    /** ISO timestamp when this segment began (live elapsed tick source). */
    startedAt?: string;
    /** Settled duration (ms); shown as "· Xs" once the segment finished. */
    durationMs?: number;
  }>(),
  { mobile: false, streaming: false, startedAt: undefined, durationMs: undefined },
);

const { t } = useI18n();

const open = ref(false);

// When streaming ends, snap the block back to collapsed (matches the original:
// the live state forces the user's manual open, which is released on settle).
watch(
  () => props.streaming,
  (now, was) => {
    if (was && !now) open.value = false;
  },
);

// Live 1s tick while this segment is streaming and has a start timestamp.
const now = ref(Date.now());
watch(
  () => [props.streaming, props.startedAt] as const,
  ([streaming, startedAt]) => {
    if (!streaming || !startedAt) return;
    now.value = Date.now();
    const timer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
    return () => clearInterval(timer);
  },
  { immediate: true },
);

const time = computed(() => {
  if (props.streaming && props.startedAt) {
    const start = Date.parse(props.startedAt);
    if (!Number.isNaN(start)) return formatElapsed(now.value - start);
  }
  if (props.durationMs !== undefined) {
    const d = formatElapsed(props.durationMs);
    return d ? `· ${d}` : '';
  }
  return '';
});

const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});
const headEl = ref<HTMLElement | null>(null);
const bodyEl = ref<HTMLElement | null>(null);
// Skip the grid-row transition when opening a body taller than the viewport
// while streaming (an instant jump reads better than a slow giant reveal).
const instant = ref(false);

function toggle(): void {
  if (!open.value) {
    const tall = (bodyEl.value?.scrollHeight ?? 0) > (typeof window !== 'undefined' ? window.innerHeight : 0);
    instant.value = props.streaming && tall;
  }
  open.value = !open.value;
  if (props.streaming) return;
  const el = headEl.value;
  if (el) nextTick(() => pinScroll(el));
}
</script>

<template>
  <div class="think" :class="{ mob: mobile, open, streaming }">
    <button class="think-head" ref="headEl" type="button" :aria-expanded="open" @click="toggle">
      <span class="think-bulb" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.3 1.5-3.5A6 6 0 0 0 6 8c0 1.2.5 2.4 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      </span>
      <span class="think-title">{{ streaming ? t('thinking.streaming') : t('thinking.panelTitle') }}</span>
      <span v-if="time" class="think-time">{{ time }}</span>
      <Icon class="think-car" name="chevron-right" size="sm" />
    </button>
    <div class="think-body" :class="{ open, instant }" :inert="!open">
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
@media (prefers-reduced-motion: reduce) {
  .think.streaming .think-title {
    animation: none;
  }
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
  padding: var(--space-1) 0 var(--space-2);
  font: var(--text-base)/var(--leading-relaxed) var(--font-ui);
  font-weight: 400;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Mobile tweaks (original .mob overrides) */
.mob .think-text {
  color: var(--color-text-faint);
  line-height: var(--leading-normal);
}
</style>
