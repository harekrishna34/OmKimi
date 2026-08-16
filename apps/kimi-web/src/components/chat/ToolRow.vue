<!-- apps/kimi-web/src/components/chat/ToolRow.vue -->
<!-- Borderless tool row matching the original Railway UI:
     .tool-line > .tl-head (icon + main + tail) + .tl-body (grid collapse). -->
<script setup lang="ts">
import { inject, nextTick, ref } from 'vue';
import Icon from '../ui/Icon.vue';
import Tooltip from '../ui/Tooltip.vue';
import StatusDot from '../ui/StatusDot.vue';

withDefaults(
  defineProps<{
    status: 'running' | 'ok' | 'error' | 'suspended';
    /** Inline-SVG glyph string (toolGlyph), or empty for none. */
    icon?: string;
    name: string;
    arg?: string;
    time?: string;
    open?: boolean;
    expandable?: boolean;
    stacked?: boolean;
    stackPosition?: 'single' | 'first' | 'middle' | 'last';
  }>(),
  {
    icon: '',
    arg: '',
    time: '',
    open: false,
    expandable: false,
    stacked: false,
    stackPosition: 'single',
  },
);

const emit = defineEmits<{ toggle: [] }>();

const pinScroll = inject<(el: HTMLElement, ms?: number) => void>('pinScroll', () => {});
const bhEl = ref<HTMLElement | null>(null);

function onHeadClick(): void {
  emit('toggle');
  const el = bhEl.value;
  if (el) nextTick(() => pinScroll(el));
}
</script>

<template>
  <div
    class="tool-line"
    :class="{
      open,
      expandable,
      err: status === 'error',
      'stack-first': stackPosition === 'first',
      'stack-middle': stackPosition === 'middle',
      'stack-last': stackPosition === 'last',
    }"
  >
    <div class="tl-head" ref="bhEl" :class="{ clickable: expandable }" @click="onHeadClick">
      <span v-if="icon" class="tl-ic" v-html="icon" aria-hidden="true" />
      <span class="tl-main">
        <span class="tl-name">{{ name }}</span>
        <Tooltip :text="arg">
          <span v-if="arg" class="tl-dim">{{ arg }}</span>
        </Tooltip>
      </span>
      <span class="tl-tail">
        <span class="tl-status" :class="status" role="status" :aria-label="status">
          <Icon v-if="status === 'ok'" name="check" size="sm" />
          <Icon v-else-if="status === 'error'" name="close" size="sm" />
          <StatusDot v-else-if="status === 'suspended'" status="suspended" />
          <StatusDot v-else status="running" />
        </span>
        <slot name="trailing" />
        <span v-if="time" class="tl-time">{{ time }}</span>
        <button v-if="expandable" class="tl-car" type="button" :aria-label="open ? 'Collapse' : 'Expand'">
          <Icon class="tl-car-ic" :name="open ? 'chevron-down' : 'chevron-right'" size="sm" />
        </button>
      </span>
    </div>
    <div class="tl-body" :class="{ open }" :inert="!open">
      <div class="tl-body-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-line {
  margin: 0;
}

.tl-head {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-1) 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
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
.tl-head.clickable:hover {
  color: var(--color-text);
}
.tl-head.clickable:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-soft);
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

.tl-name {
  font-weight: var(--weight-regular);
  color: var(--color-text-muted);
  flex: none;
}
.tl-dim {
  color: var(--color-text-muted);
  line-height: var(--leading-tight);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.tl-time {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  flex: none;
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
  padding: 0;
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

/* Stacked calls: rows are flat with a small gap. */
.tool-line.stack-middle,
.tool-line.stack-last {
  margin-top: 4px;
}

/* Mobile bubble layout: no left gutter indent. */
.tool-line.mob {
  margin: 0;
}
</style>
