import { describe, expect, it } from 'vitest';

import { KnowledgeToolInputSchema } from '#/agent/tools/knowledge/knowledge';
import { KNOWLEDGE_TOOL_NAME, KnowledgeTool } from '#/agent/tools/knowledge/knowledgeTool';
import type {
  IWorkspaceKnowledgeService,
  KnowledgeEntry,
  KnowledgeInput,
} from '#/workspace/workspaceKnowledge/workspaceKnowledge';
import { executeTool } from '../../../tools/fixtures/execute-tool';

const signal = new AbortController().signal;

function makeKnowledgeService(
  initial: readonly KnowledgeEntry[] = [],
): IWorkspaceKnowledgeService & { readonly entries: () => readonly KnowledgeEntry[] } {
  let entries = [...initial];
  return {
    _serviceBrand: undefined,
    ready: Promise.resolve(),
    entries: () => entries,
    async list() {
      return entries;
    },
    async getEntry(id: string) {
      return entries.find((e) => e.id === id);
    },
    async upsert(input: KnowledgeInput, id?: string) {
      if (id !== undefined) {
        const existing = entries.find((e) => e.id === id);
        if (existing === undefined) throw new Error(`Knowledge entry not found: ${id}`);
        const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
        entries = entries.map((e) => (e.id === id ? updated : e));
        return updated;
      }
      const entry: KnowledgeEntry = {
        id: `kb-${entries.length + 1}`,
        name: input.name,
        useWhen: input.useWhen,
        content: input.content,
        tags: input.tags ?? [],
        active: input.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      entries = [...entries, entry];
      return entry;
    },
    async remove(id: string) {
      const before = entries.length;
      entries = entries.filter((e) => e.id !== id);
      return entries.length < before;
    },
    async getSystemPromptBlock() {
      return '';
    },
  };
}

function makeTool(initial: readonly KnowledgeEntry[] = []) {
  const service = makeKnowledgeService(initial);
  const ref = {
    current: service,
    onDidChange: () => ({ dispose: () => {} }),
  };
  return { tool: new KnowledgeTool(ref), service };
}

describe('KnowledgeTool', () => {
  it('has name, description, and parameters from the current schema', () => {
    const { tool } = makeTool();

    expect(KNOWLEDGE_TOOL_NAME).toBe('Knowledge');
    expect(tool.name).toBe(KNOWLEDGE_TOOL_NAME);
    expect(tool.description.length).toBeGreaterThan(0);
    expect(KnowledgeToolInputSchema.safeParse({ action: 'list' }).success).toBe(true);
    expect(
      KnowledgeToolInputSchema.safeParse({ action: 'add', name: 'x', useWhen: '', content: 'y' })
        .success,
    ).toBe(true);
    expect(KnowledgeToolInputSchema.safeParse({ action: 'add', name: 'x' }).success).toBe(false);
    expect(KnowledgeToolInputSchema.safeParse({ action: 'nope' }).success).toBe(false);
    // A discriminated union serializes as a `oneOf` of object variants.
    expect(tool.parameters).toHaveProperty('oneOf');
    expect((tool.parameters as { oneOf?: unknown[] }).oneOf).toHaveLength(4);
  });

  it('description guides the model toward durable preferences, not secrets', () => {
    const { tool } = makeTool();
    expect(tool.description).toMatch(/durable/i);
    expect(tool.description).toMatch(/yaad rakhna/i);
    expect(tool.description).toMatch(/secrets, credentials, or tokens/i);
    expect(tool.description).toMatch(/AGENTS\.md/i);
  });

  it('list action renders stored entries without mutating them', async () => {
    const { tool, service } = makeTool([
      {
        id: 'kb-1',
        name: 'Language preference',
        useWhen: 'Whenever communicating with the user',
        content: 'Always use Hinglish.',
        active: true,
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      },
    ]);

    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_1',
      args: { action: 'list' },
      signal,
    });

    expect(result).toMatchObject({ isError: false });
    expect(result.output).toContain('Knowledge entries (1)');
    expect(result.output).toContain('Language preference');
    expect(result.output).toContain('Always use Hinglish.');
    expect(service.entries()).toHaveLength(1);
  });

  it('list action reports the empty store', async () => {
    const { tool } = makeTool();
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_1',
      args: { action: 'list' },
      signal,
    });
    expect(result).toMatchObject({ isError: false });
    expect(result.output).toContain('No knowledge entries stored yet.');
  });

  it('add action stores a new entry', async () => {
    const { tool, service } = makeTool();
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_2',
      args: {
        action: 'add',
        name: 'Language preference',
        useWhen: 'Whenever communicating with the user',
        content: 'Always use Hinglish.',
      },
      signal,
    });

    expect(result).toMatchObject({ isError: false });
    expect(result.output).toContain('Knowledge saved.');
    expect(result.output).toContain('Language preference');
    expect(service.entries()).toHaveLength(1);
    expect(service.entries()[0]).toMatchObject({ name: 'Language preference', active: true });
  });

  it('update action revises an existing entry', async () => {
    const { tool, service } = makeTool([
      {
        id: 'kb-1',
        name: 'Language preference',
        useWhen: 'Whenever communicating with the user',
        content: 'Always use Hinglish.',
        active: true,
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      },
    ]);
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_3',
      args: {
        action: 'update',
        id: 'kb-1',
        content: 'Always use Hindi.',
      },
      signal,
    });

    expect(result).toMatchObject({ isError: false });
    expect(result.output).toContain('Knowledge updated.');
    expect(result.output).toContain('Always use Hindi.');
    expect(service.entries()[0]).toMatchObject({
      name: 'Language preference',
      content: 'Always use Hindi.',
    });
  });

  it('update action fails for an unknown id', async () => {
    const { tool } = makeTool();
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_4',
      args: { action: 'update', id: 'kb-missing', content: 'x' },
      signal,
    });
    expect(result).toMatchObject({ isError: true });
    expect(result.output).toContain('not found');
  });

  it('remove action deletes an entry and reports it', async () => {
    const { tool, service } = makeTool([
      {
        id: 'kb-1',
        name: 'Language preference',
        useWhen: 'Whenever communicating with the user',
        content: 'Always use Hinglish.',
        active: true,
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      },
    ]);
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_5',
      args: { action: 'remove', id: 'kb-1' },
      signal,
    });
    expect(result).toMatchObject({ isError: false });
    expect(result.output).toContain('Knowledge entry removed');
    expect(service.entries()).toHaveLength(0);
  });

  it('remove action fails for an unknown id', async () => {
    const { tool } = makeTool();
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_6',
      args: { action: 'remove', id: 'kb-missing' },
      signal,
    });
    expect(result).toMatchObject({ isError: true });
    expect(result.output).toContain('not found');
  });

  it('reports the store as unavailable when the workspace layer is absent', async () => {
    const tool = new KnowledgeTool({
      current: undefined,
      onDidChange: () => ({ dispose: () => {} }),
    });
    const result = await executeTool(tool, {
      turnId: 1,
      toolCallId: 'call_7',
      args: { action: 'list' },
      signal,
    });
    expect(result).toMatchObject({ isError: true });
    expect(result.output).toContain('not available');
  });
});
