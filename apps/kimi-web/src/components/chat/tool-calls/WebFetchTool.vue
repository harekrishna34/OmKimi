<!-- apps/kimi-web/src/components/chat/tool-calls/WebFetchTool.vue -->
<!-- Web fetch tool row (ported from the original bundle's WebFetchTool, scope
     data-v-d6dc5dd3). Collapsed: label + host/first-path-segment. Expanded:
     mono URL + output block. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilePreviewRequest, ToolCall, ToolMedia } from '../../../types';
import { parseArg, str } from '../../../lib/toolMeta';
import ToolDisclosure from './ToolDisclosure.vue';
import ToolOutputBlock from './ToolOutputBlock.vue';
import Icon from '../../ui/Icon.vue';

const props = withDefaults(
  defineProps<{
    tool: ToolCall;
    mobile?: boolean;
    stackPosition?: 'single' | 'first' | 'middle' | 'last';
    toolDiffPanel?: boolean;
  }>(),
  { mobile: false, stackPosition: 'single', toolDiffPanel: false },
);

defineEmits<{
  openMedia: [media: ToolMedia];
  openFile: [target: FilePreviewRequest];
  openToolDiff: [id: string];
  openAgent: [toolCallId: string];
}>();

const { t } = useI18n();

const status = computed(() => props.tool.status);
const url = computed(() => {
  const d = parseArg(props.tool.arg);
  return str(d?.url) ?? str(d?.uri) ?? '';
});

/** Reduce a URL to "host[/first-segment]" for the compact header (ported from
 *  the original bundle's n6e). */
function urlHost(u: string): string {
  try {
    const h = new URL(u);
    const seg = h.pathname.split('/').find(Boolean);
    return seg ? `${h.host}/${seg}` : h.host;
  } catch {
    return u.replace(/^https?:\/\//, '');
  }
}
const host = computed(() => (url.value ? urlHost(url.value) : ''));

const hasOutput = computed(() => !!props.tool.output && props.tool.output.length > 0);
const expandable = computed(() => hasOutput.value);
const open = ref(props.tool.defaultExpanded === true && expandable.value);

watch(
  () => [props.tool.defaultExpanded, props.tool.output?.length, props.tool.status] as const,
  () => {
    if (props.tool.defaultExpanded === true && expandable.value) open.value = true;
  },
);
</script>

<template>
  <ToolDisclosure :status="status" :open="open" :expandable="expandable" @toggle="open = !open">
    <template #leading>
      <Icon name="globe" size="sm" />
    </template>
    <template #body>
      <div v-if="url" class="fetch-url">{{ url }}</div>
      <ToolOutputBlock :lines="tool.output" :empty-text="t('tools.output.waiting')" />
    </template>
    <span class="tl-name">{{ t('tools.label.web_fetch') }}</span>
    <span v-if="host" class="tl-dim">{{ host }}</span>
    <span v-else class="tl-dim">{{ tool.arg }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-d6dc5dd3). */
.fetch-url {
  font-family: var(--font-mono);
  font-size: calc(var(--content-font-size) - 2px);
  line-height: 1.6;
  color: var(--color-text-faint);
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: var(--space-1);
}
</style>
