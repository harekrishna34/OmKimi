import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SyncDescriptor } from '#/_base/di/descriptors';
import { DisposableStore } from '#/_base/di/lifecycle';
import { ServiceCollection } from '#/_base/di/serviceCollection';
import { TestInstantiationService } from '#/_base/di/test';
import { ILogService } from '#/_base/log/log';
import { JsonAtomicDocumentStore } from '#/persistence/backends/node-fs/atomicDocumentStore';
import { InMemoryStorageService } from '#/persistence/backends/memory/inMemoryStorageService';
import { IAtomicDocumentStore } from '#/persistence/interface/atomicDocumentStore';
import { IFileSystemStorageService } from '#/persistence/interface/storage';
import { IWorkspaceContext } from '#/workspace/workspaceContext/workspaceContext';
import { IWorkspaceKnowledgeService } from '#/workspace/workspaceKnowledge/workspaceKnowledge';
import { WorkspaceKnowledgeService } from '#/workspace/workspaceKnowledge/workspaceKnowledgeService';

import { stubLog } from '../../_base/log/stubs';

function makeContext(): IWorkspaceContext {
  return {
    _serviceBrand: undefined,
    workspaceId: 'wd_test',
    cwd: '/tmp/workspaces/wd_test',
    source: 'local',
    meta: {
      id: 'wd_test',
      root: '/tmp/workspaces/wd_test',
      name: 'test',
      createdAt: 1,
      lastOpenedAt: 1,
    },
    persistenceScope: 'sessions/wd_test',
    osBackendId: 'local',
    persistenceBackendId: 'local',
  };
}

describe('WorkspaceKnowledgeService', () => {
  let disposables: DisposableStore;
  let ix: TestInstantiationService;

  beforeEach(() => {
    disposables = new DisposableStore();
    ix = disposables.add(new TestInstantiationService());
    ix.stub(ILogService, stubLog());
    ix.stub(IWorkspaceContext, makeContext());
    ix.set(IFileSystemStorageService, new SyncDescriptor(InMemoryStorageService));
    ix.set(IAtomicDocumentStore, new SyncDescriptor(JsonAtomicDocumentStore));
    ix.set(IWorkspaceKnowledgeService, new SyncDescriptor(WorkspaceKnowledgeService));
  });

  afterEach(() => {
    disposables.dispose();
  });

  it('starts empty', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    expect(await service.list()).toEqual([]);
    expect(await service.getSystemPromptBlock()).toBe('');
  });

  it('upserts a new entry and persists it', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    const entry = await service.upsert({
      name: 'Language preference',
      useWhen: 'Whenever communicating with the user',
      content: 'Always use Hinglish.',
    });
    expect(entry).toMatchObject({
      name: 'Language preference',
      content: 'Always use Hinglish.',
      active: true,
    });
    expect(entry.id).toBeTruthy();
    expect(await service.list()).toHaveLength(1);

    // Fresh instance over the same store must see the persisted entry.
    const reloaded = ix
      .createChild(new ServiceCollection())
      .createInstance(WorkspaceKnowledgeService);
    await reloaded.ready;
    expect(await reloaded.list()).toHaveLength(1);
    expect((await reloaded.list())[0]?.name).toBe('Language preference');
  });

  it('updates and removes entries by id', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    const entry = await service.upsert({
      name: 'Language preference',
      useWhen: 'Whenever communicating with the user',
      content: 'Always use Hinglish.',
    });
    const updated = await service.upsert(
      {
        name: 'Language preference',
        useWhen: 'Whenever communicating with the user',
        content: 'Always use Hindi.',
      },
      entry.id,
    );
    expect(updated.content).toBe('Always use Hindi.');
    expect(await service.getEntry(entry.id)).toMatchObject({ content: 'Always use Hindi.' });
    expect(await service.remove(entry.id)).toBe(true);
    expect(await service.list()).toEqual([]);
    expect(await service.remove(entry.id)).toBe(false);
  });

  it('rejects content over 2000 characters', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    await expect(
      service.upsert({
        name: 'Too long',
        useWhen: 'always',
        content: 'x'.repeat(2001),
      }),
    ).rejects.toThrow('2000');
  });

  it('renders only active entries as the system prompt block', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    await service.upsert({
      name: 'Language preference',
      useWhen: 'Whenever communicating with the user',
      content: 'Always use Hinglish.',
    });
    const inactive = await service.upsert({
      name: 'Old preference',
      useWhen: 'always',
      content: 'Superseded.',
      active: false,
    });
    const block = await service.getSystemPromptBlock();
    expect(block).toContain('## Knowledge');
    expect(block).toContain('**Language preference**');
    expect(block).toContain('Always use Hinglish.');
    expect(block).not.toContain('Old preference');
    expect(block).not.toContain('Superseded.');

    await service.remove(inactive.id);
    expect((await service.getSystemPromptBlock()).split('\n').filter((l) => l.startsWith('- '))).toHaveLength(1);
  });

  it('renders multi-line content indented in the block', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    await service.upsert({
      name: 'Style',
      useWhen: 'always',
      content: 'First line.\nSecond line.',
    });
    const block = await service.getSystemPromptBlock();
    expect(block).toContain('First line.\n  Second line.');
  });

  it('exposes the KnowledgeEntry shape through list results', async () => {
    const service = ix.get(IWorkspaceKnowledgeService);
    await service.upsert({
      name: 'User name',
      useWhen: 'Whenever addressing the user',
      content: 'The user is Rahul.',
      tags: ['auto-learned'],
    });
    const list = await service.list();
    const entry = list[0];
    expect(entry).toBeDefined();
    expect(entry).toMatchObject({
      name: 'User name',
      useWhen: 'Whenever addressing the user',
      content: 'The user is Rahul.',
      tags: ['auto-learned'],
      active: true,
    });
    expect(entry?.createdAt).toBeTruthy();
    expect(entry?.updatedAt).toBeTruthy();
  });
});
