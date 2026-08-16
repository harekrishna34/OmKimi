<!-- apps/kimi-web/src/components/chat/tool-calls/HighlightedCode.vue -->
<!-- Minimal line-numbered code renderer (stand-in for the original bundle's
     HighlightedCode, which shelled out to a syntax-highlighting worker).
     Renders plain code lines or diff rows with the original class vocabulary
     (.hl-code/.hl-body/.hl-row/.hl-gutter/.hl-sign/.hl-text) so the scoped
     styles and tool components port 1:1. No syntax highlighting — text is
     rendered verbatim with the shared token palette. -->
<script setup lang="ts">
import { computed } from 'vue';
import type { DiffViewLine } from '../../../types';

const props = withDefaults(
  defineProps<{
    /** Plain source lines, or a single multi-line string. */
    code?: string | string[];
    /** Diff rows (EditTool): type + text + optional old/new line numbers. */
    lines?: DiffViewLine[];
    /** File path — kept for API parity with the original; unused for styling. */
    path?: string;
    /** true → gutter numbers for diff rows; number[] → per-row numbers for code. */
    lineNumbers?: boolean | number[];
    framed?: boolean;
  }>(),
  { code: undefined, lines: undefined, path: undefined, lineNumbers: false, framed: true },
);

const isDiff = computed(() => props.lines !== undefined);
const gutterDiff = computed(() => props.lineNumbers === true && isDiff.value);
const numberArray = computed(() => (Array.isArray(props.lineNumbers) ? props.lineNumbers : null));
const hasOldNo = computed(() => (props.lines ?? []).some((l) => l.oldNo !== undefined));
const hasNewNo = computed(() => (props.lines ?? []).some((l) => l.newNo !== undefined));

function splitCode(code: string | string[]): string[] {
  return Array.isArray(code) ? code : code === '' ? [] : code.endsWith('\n') ? code.slice(0, -1).split('\n') : code.split('\n');
}
const codeLines = computed(() => splitCode(props.code ?? ''));

const gutterCh = computed(() => {
  let max = 0;
  if (numberArray.value) for (const n of numberArray.value) if (n > max) max = n;
  else
    for (const l of props.lines ?? []) {
      if (l.oldNo !== undefined && l.oldNo > max) max = l.oldNo;
      if (l.newNo !== undefined && l.newNo > max) max = l.newNo;
    }
  return Math.max(4, String(max).length);
});

function sign(l: DiffViewLine): string {
  return l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' ';
}
</script>

<template>
  <div
    class="hl-code"
    :class="{ gutter: gutterDiff, 'plain-pad': !isDiff && !numberArray, framed }"
    :style="{ '--gutter-ch': `${gutterCh}ch` }"
  >
    <div class="hl-body">
      <template v-if="isDiff">
        <div v-for="(l, i) in lines" :key="i" class="hl-row" :class="`row-${l.type}`">
          <template v-if="gutterDiff">
            <span v-if="hasOldNo" class="hl-gutter">{{ l.oldNo ?? '' }}</span>
            <span v-if="hasNewNo" class="hl-gutter new">{{ l.newNo ?? '' }}</span>
          </template>
          <span class="hl-sign">{{ sign(l) }}</span>
          <span class="hl-text">{{ l.text }}</span>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(line, i) in codeLines"
          :key="i"
          class="hl-row"
          :data-line="numberArray ? numberArray[i] : undefined"
        >
          <span v-if="numberArray" class="hl-gutter">{{ numberArray[i] ?? '' }}</span>
          <span class="hl-text">{{ line }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-ede1b080), mapped onto this
   repo's tokens: --color-well → --color-surface-sunken,
   --color-diff-add-bg/-del-bg → --color-success-soft/-danger-soft,
   --code-font-size → calc(var(--content-font-size) - 2px). */
.hl-code {
  border: 0.5px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  overflow: auto;
  max-height: calc(24 * 1.5 * var(--ui-font-size));
  overscroll-behavior: contain;
  font-family: var(--font-mono);
  font-size: calc(var(--content-font-size) - 2px);
  line-height: var(--leading-normal);
  font-feature-settings: 'liga' 0, 'calt' 0;
  font-variant-ligatures: none;
}
.hl-code:not(.framed) {
  border: none;
  border-radius: 0;
  background: transparent;
  max-height: none;
  overflow: visible;
}
.hl-body {
  width: max-content;
  min-width: 100%;
  padding: var(--space-1) 0 var(--space-2);
}
.hl-code.plain-pad .hl-body {
  padding-left: var(--space-3);
}
.hl-row {
  display: flex;
  align-items: flex-start;
  min-height: calc(1em * var(--leading-normal));
  white-space: pre;
  width: 100%;
}
.hl-gutter {
  flex: none;
  box-sizing: content-box;
  min-width: var(--gutter-ch, 4ch);
  padding: 0 var(--space-2);
  text-align: right;
  color: var(--color-text-faint);
  user-select: none;
  border-right: 0.5px solid var(--color-line);
  font-variant-numeric: tabular-nums;
}
.hl-sign {
  flex: none;
  width: 16px;
  text-align: center;
  color: var(--color-text-muted);
  user-select: none;
}
.hl-text {
  flex: none;
  padding-right: 14px;
  white-space: pre;
  color: var(--color-text);
}
.hl-gutter + .hl-text {
  padding-left: var(--space-2);
}
.row-add {
  background: var(--color-success-soft);
}
.row-add .hl-sign {
  color: var(--color-success);
}
.row-del {
  background: var(--color-danger-soft);
}
.row-del .hl-sign {
  color: var(--color-danger);
}
.row-hunk {
  background: var(--color-surface-sunken);
}
.row-hunk .hl-text {
  color: var(--color-text-muted);
}
.hl-code.gutter .row-add {
  box-shadow: inset 2px 0 color-mix(in srgb, var(--color-success) 55%, transparent);
}
.hl-code.gutter .row-del {
  box-shadow: inset 2px 0 color-mix(in srgb, var(--color-danger) 55%, transparent);
}
</style>
