<!-- apps/kimi-web/src/components/chat/tool-calls/ToolDisclosure.vue -->
<!-- Shared slot-based tool row (ported from the original bundle's ToolDisclosure,
     scope data-v-a1cc86ca). Every tool renderer builds its row from the four
     slots: leading → .tl-ic, default → .tl-main (chevron appended when
     expandable), trailing → .tl-tail (before .tl-status), body → .tl-body. -->
<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '../../ui/Icon.vue';
import StatusDot from '../../ui/StatusDot.vue';

const props = withDefaults(
  defineProps<{
    status?: string;
    open?: boolean;
    expandable?: boolean;
  }>(),
  { status: undefined, open: false, expandable: false },
);

const emit = defineEmits<{ toggle: [] }>();

const { t } = useI18n();

const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});
const headEl = ref<HTMLElement | null>(null);

function onHeadClick(): void {
  if (!props.expandable) return;
  emit('toggle');
  const el = headEl.value;
  if (el) nextTick(() => pinScroll(el));
}

const carLabel = computed(() =>
  props.open ? t('tools.disclosure.collapse') : t('tools.disclosure.expand'),
);
</script>

<template>
  <div
    class="tool-line"
    :class="{ open, expandable, err: status === 'error' }"
  >
    <div ref="headEl" class="tl-head" :class="{ clickable: expandable }" @click="onHeadClick">
      <span class="tl-ic"><slot name="leading" /></span>
      <span class="tl-main">
        <slot />
        <button
          v-if="expandable"
          class="tl-car"
          type="button"
          :aria-expanded="open"
          :aria-label="carLabel"
          @click.stop="onHeadClick"
        >
          <Icon class="tl-car-ic" name="chevron-right" size="sm" aria-hidden="true" />
        </button>
      </span>
      <span class="tl-tail">
        <slot name="trailing" />
        <span class="tl-status" :class="status" role="status" :aria-label="status">
          <Icon v-if="status === 'ok'" name="check" size="sm" />
          <Icon v-else-if="status === 'error'" name="close" size="sm" />
          <StatusDot v-else-if="status === 'suspended'" status="suspended" />
          <StatusDot v-else status="running" />
        </span>
      </span>
    </div>
    <div v-if="expandable" class="tl-body" :class="{ open }" :inert="!open">
      <div class="tl-body-inner">
        <slot name="body" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ported verbatim from the deployed bundle (scope data-v-a1cc86ca). Slotted
   content selectors (`.tl-name`, `.tl-file`, …) use :slotted() so the styles
   reach elements authored in the tool components that fill the slots. */
.tl-head {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-1) 0;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  line-height: 1;
  text-align: left;
}
.tl-head.clickable {
  cursor: pointer;
  user-select: none;
}

.tl-ic {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex: none;
  color: var(--color-text-faint);
}

.tl-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.tl-tail {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: none;
}

.tl-status {
  display: inline-flex;
  align-items: center;
  flex: none;
}
.tl-status.ok {
  color: var(--color-success);
}
.tl-status.error {
  color: var(--color-danger);
}

.tl-car {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-faint);
  cursor: pointer;
  flex: none;
}
.tl-car:hover {
  color: var(--color-text);
}
.tl-car:focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
.tl-car-ic {
  transition: transform var(--duration-base) var(--ease-out);
}
.tool-line.open .tl-car-ic {
  transform: rotate(90deg);
}

.tl-body {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}
.tl-body.open {
  grid-template-rows: minmax(0, 1fr);
}
.tl-body-inner {
  min-height: 0;
  overflow: hidden;
  padding: 2px var(--space-2) var(--space-1) 0;
}

.tl-main :slotted(.tl-name) {
  font-weight: var(--weight-regular);
  color: var(--color-text-muted);
  flex: none;
}
.tl-main :slotted(.tl-dim) {
  color: var(--color-text-muted);
  line-height: var(--leading-tight);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tl-main :slotted(.tl-faint) {
  color: var(--color-text-faint);
  line-height: var(--leading-tight);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tl-main :slotted(.tl-mono) {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-feature-settings: 'liga' 0, 'calt' 0;
  font-variant-ligatures: none;
  color: var(--color-text-muted);
  line-height: normal;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tl-main :slotted(.tl-file) {
  font-weight: var(--weight-regular);
  color: var(--color-text);
  line-height: var(--leading-tight);
  flex: none;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  padding: 0 1px;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
}
.tl-main :slotted(.tl-file):hover {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.tl-main :slotted(.tl-file):focus-visible {
  outline: none;
  box-shadow: var(--p-focus-ring);
}
.tl-tail :slotted(.tl-pill) {
  font-size: var(--text-xs);
  line-height: 1.5;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  flex: none;
  white-space: nowrap;
}
.tl-tail :slotted(.tl-chip) {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  flex: none;
  white-space: nowrap;
}
.tl-tail :slotted(.tl-add) {
  color: var(--color-success);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  flex: none;
}
.tl-tail :slotted(.tl-del) {
  color: var(--color-danger);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  flex: none;
}
</style>
