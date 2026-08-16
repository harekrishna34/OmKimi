<!-- apps/kimi-web/src/components/chat/StatusGlyph.vue -->
<!-- Shared per-row status glyph for todo lists (and other list rows). Ported
     from the original bundle's StatusGlyph (scope data-v-5e37bd5c): pending/run
     render as a StatusDot (idle/running), done/fail as a check/close icon. -->
<script setup lang="ts">
import Icon from '../ui/Icon.vue';
import StatusDot from '../ui/StatusDot.vue';

export type StatusGlyphStatus = 'pending' | 'run' | 'done' | 'fail';

const props = defineProps<{ status: StatusGlyphStatus }>();
</script>

<template>
  <span class="status-glyph" :class="`s-${props.status}`" aria-hidden="true">
    <StatusDot v-if="props.status === 'run'" status="running" />
    <StatusDot v-else-if="props.status === 'pending'" status="idle" />
    <Icon v-else-if="props.status === 'done'" name="check" size="sm" />
    <Icon v-else name="close" size="sm" />
  </span>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-5e37bd5c). */
.status-glyph {
  flex: none;
  width: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.status-glyph.s-run {
  color: var(--color-accent);
}
.status-glyph.s-done {
  color: var(--color-success);
}
.status-glyph.s-fail {
  color: var(--color-danger);
}
.status-glyph.s-pending {
  color: var(--color-text-faint);
}
</style>
