<!-- apps/kimi-web/src/components/settings/ToolsSection.vue -->
<!-- Tools configuration: Web Search (Tavily) API key + MCP Servers management -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from '../ui/Button.vue';
import Switch from '../ui/Switch.vue';

const { t } = useI18n();

const props = defineProps<{
  config?: Record<string, unknown> | null;
  configSaving?: boolean;
}>();

const emit = defineEmits<{
  updateConfig: [patch: Record<string, unknown>];
}>();

// --- Web Search (Tavily) ---
const tavilyKey = ref('');
const tavilySaving = ref(false);
const tavilySaved = ref(false);

function onTavilyKeyInput(e: Event): void {
  tavilyKey.value = (e.target as HTMLInputElement).value;
  tavilySaved.value = false;
}

async function saveTavilyKey(): Promise<void> {
  if (!tavilyKey.value.trim()) return;
  tavilySaving.value = true;
  try {
    await fetch('/api/v1/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ websearch: { apiKey: tavilyKey.value.trim() } }),
    });
    tavilySaved.value = true;
  } catch (err) {
    console.warn('saveTavilyKey failed', err);
  } finally {
    tavilySaving.value = false;
  }
}

// --- MCP Servers ---
const mcpServers = ref<Array<{ id: string; name: string; status: string; toolCount: number }>>([]);
const mcpLoading = ref(false);
const mcpRestartingId = ref<string | null>(null);

async function loadMcpServers(): Promise<void> {
  if (mcpLoading.value) return;
  mcpLoading.value = true;
  try {
    const res = await fetch('/api/v1/mcp/servers');
    if (res.ok) {
      const data = await res.json();
      mcpServers.value = Array.isArray(data) ? data : data.servers ?? [];
    }
  } catch (err) {
    console.warn('loadMcpServers failed', err);
  } finally {
    mcpLoading.value = false;
  }
}

async function restartMcpServer(id: string): Promise<void> {
  if (mcpRestartingId.value) return;
  mcpRestartingId.value = id;
  try {
    await fetch(`/api/v1/mcp/servers/${encodeURIComponent(id)}:restart`, { method: 'POST' });
    await loadMcpServers();
  } catch (err) {
    console.warn('restartMcpServer failed', err);
  } finally {
    mcpRestartingId.value = null;
  }
}

onMounted(() => {
  loadMcpServers();
});
</script>

<template>
  <section class="sec">
    <!-- Web Search (Tavily) -->
    <h3 class="sec-title">{{ t('settings.toolsTitle', 'Tools') }}</h3>
    <p class="sec-desc">{{ t('settings.toolsDesc', 'Configure external tools and services for the agent.') }}</p>

    <div class="tool-card">
      <div class="tool-head">
        <div class="tool-icon">🔍</div>
        <div class="tool-info">
          <div class="tool-name">Tavily Web Search</div>
          <div class="tool-desc">{{ t('settings.tavilyDesc', 'Configure the Tavily web search API so the agent can search the web.') }}</div>
        </div>
      </div>
      <div class="tool-body">
        <label class="tool-label">API Key</label>
        <div class="tool-input-row">
          <input
            type="password"
            class="tool-input"
            placeholder="tvly-..."
            :value="tavilyKey"
            @input="onTavilyKeyInput"
          />
          <Button
            variant="primary"
            size="sm"
            :disabled="tavilySaving || !tavilyKey.trim()"
            @click="saveTavilyKey"
          >
            {{ tavilySaving ? '...' : tavilySaved ? '✓ Saved' : 'Save' }}
          </Button>
        </div>
        <div class="tool-hint">API key is stored securely and never shared.</div>
      </div>
    </div>

    <!-- MCP Servers -->
    <div class="tool-card">
      <div class="tool-head">
        <div class="tool-icon">🔌</div>
        <div class="tool-info">
          <div class="tool-name">{{ t('settings.mcpServersTitle', 'MCP Servers') }}</div>
          <div class="tool-desc">{{ t('settings.mcpServersDesc', 'Model Context Protocol servers providing additional tools.') }}</div>
        </div>
      </div>
      <div class="tool-actions">
        <Button variant="secondary" size="sm" :disabled="mcpLoading" @click="loadMcpServers">
          {{ mcpLoading ? t('settings.mcpLoading', 'Loading...') : t('settings.mcpRefresh', 'Refresh') }}
        </Button>
      </div>
      <div v-if="mcpServers.length > 0" class="mcp-list">
        <div v-for="server in mcpServers" :key="server.id" class="mcp-row">
          <div class="mcp-info">
            <span class="mcp-name">{{ server.name || server.id }}</span>
            <span class="mcp-meta">
              <span class="mcp-status" :class="server.status">{{ server.status }}</span>
              <span v-if="server.toolCount" class="mcp-tools">
                {{ t('settings.mcpToolCount', '{count} tools', { count: server.toolCount }) }}
              </span>
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            :disabled="mcpRestartingId === server.id"
            @click="restartMcpServer(server.id)"
          >
            {{ mcpRestartingId === server.id ? t('settings.mcpRestarting', 'Restarting...') : t('settings.mcpRestart', 'Restart') }}
          </Button>
        </div>
      </div>
      <div v-else-if="!mcpLoading" class="mcp-empty">
        {{ t('settings.mcpEmpty', 'No MCP servers configured.') }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.sec { padding: var(--space-4) 0; border-bottom: 1px solid var(--color-line); }
.sec:last-child { border-bottom: none; }
.sec-title {
  margin: 0 0 var(--space-1);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.sec-desc {
  margin: 0 0 var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
}

.tool-card {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-bg);
  margin-bottom: var(--space-3);
}
.tool-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
}
.tool-icon { font-size: 20px; flex: none; margin-top: 2px; }
.tool-info { flex: 1; min-width: 0; }
.tool-name {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}
.tool-desc {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: 2px;
}
.tool-body {
  padding: 0 var(--space-4) var(--space-4);
}
.tool-label {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}
.tool-input-row {
  display: flex;
  gap: var(--space-2);
}
.tool-input {
  flex: 1;
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
}
.tool-input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--p-focus-ring);
}
.tool-hint {
  margin-top: var(--space-2);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.tool-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--space-4) var(--space-3);
}

.mcp-list {
  border-top: 1px solid var(--color-line);
}
.mcp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-line);
}
.mcp-row:first-child { border-top: none; }
.mcp-row:hover { background: var(--color-surface-sunken); }
.mcp-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mcp-name {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mcp-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
}
.mcp-status {
  font-family: var(--font-mono);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
}
.mcp-status.connected { background: #16a34a20; color: #16a34a; }
.mcp-status.error { background: #dc262620; color: #dc2626; }
.mcp-tools { color: var(--color-text-faint); }

.mcp-empty {
  padding: var(--space-4);
  text-align: center;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  border-top: 1px solid var(--color-line);
}
</style>
