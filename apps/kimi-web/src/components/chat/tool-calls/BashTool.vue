<!-- apps/kimi-web/src/components/chat/tool-calls/BashTool.vue -->
<!-- Bash tool row (ported from the original bundle's BashTool, scope
     data-v-8b2cbadb). Collapsed: label + mono command + timing chip. Expanded:
     command echo + output block (waiting/empty text while running/settled). -->
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
const command = computed(() => {
  const d = parseArg(props.tool.arg);
  return (str(d?.command) ?? str(d?.cmd) ?? str(d?.script) ?? props.tool.arg.replace(/^·\s*/, '')).trim();
});
const isRunning = computed(() => props.tool.status === 'running');
const hasOutput = computed(() => !!props.tool.output && props.tool.output.length > 0);
const expandable = computed(() => hasOutput.value || isRunning.value || command.value.length > 0);
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
      <Icon name="terminal" size="sm" />
    </template>
    <template #trailing>
      <span v-if="tool.timing" class="tl-chip">{{ tool.timing }}</span>
    </template>
    <template #body>
      <div class="cmd-echo">{{ command }}</div>
      <ToolOutputBlock
        :lines="tool.output"
        :empty-text="isRunning ? t('tools.output.waiting') : t('tools.output.empty')"
      />
    </template>
    <span class="tl-name">{{ t('tools.label.bash') }}</span>
    <span class="tl-mono">{{ command }}</span>
  </ToolDisclosure>
</template>

<style scoped>
/* Ported from the deployed bundle (scope data-v-8b2cbadb). */
.cmd-echo {
  font-family: var(--font-mono);
  font-size: calc(var(--content-font-size) - 2px);
  line-height: 1.6;
  font-feature-settings: 'liga' 0, 'calt' 0;
  font-variant-ligatures: none;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: var(--space-1);
}
</style>
