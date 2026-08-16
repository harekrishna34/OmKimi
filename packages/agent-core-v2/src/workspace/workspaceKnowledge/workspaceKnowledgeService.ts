/**
 * `workspaceKnowledge` domain — `IWorkspaceKnowledgeService` implementation.
 *
 * Persists the workspace knowledge document (`entries.json`) through the
 * `storage` access-pattern store (`IAtomicDocumentStore`), rooted at a
 * `knowledge` sub-scope of the handler's `persistenceScope` from
 * `workspaceContext`. Loads the existing document on construction and
 * serializes mutations through a write queue; renders the active entries as
 * a system prompt block and logs through `log`. Bound at Workspace scope.
 */

import { ScopeActivation, registerScopedService } from '#/_base/di/scope';
import { Service } from '#/_base/di/service';
import { LifecycleScope } from '#/app/scopes';
import { ILogService } from '#/_base/log/log';
import { IAtomicDocumentStore } from '#/persistence/interface/atomicDocumentStore';
import { Emitter, type Event } from '#/_base/event';

import { IWorkspaceContext } from '#/workspace/workspaceContext/workspaceContext';

import {
  IWorkspaceKnowledgeService,
  type KnowledgeEntry,
  type KnowledgeInput,
} from './workspaceKnowledge';

const DOC_KEY = 'entries.json';
const CONTENT_MAX_LENGTH = 2000;

interface KnowledgeDocument {
  readonly version: 1;
  readonly entries: KnowledgeEntry[];
}

function normalizeEntry(entry: KnowledgeEntry): KnowledgeEntry {
  return { ...entry, tags: entry.tags ?? [], active: entry.active !== false };
}

function entryToBlock(entry: KnowledgeEntry): string {
  const when = entry.useWhen.trim().length > 0 ? entry.useWhen.trim() : 'Whenever relevant';
  return (
    `- **${entry.name}** (use when: ${when})\n` +
    `  ${entry.content.trim().split('\n').join('\n  ')}`
  );
}

export class WorkspaceKnowledgeService extends Service implements IWorkspaceKnowledgeService {
  declare readonly _serviceBrand: undefined;

  readonly ready: Promise<void>;
  readonly onDidChange: Event<void>;

  private readonly _onDidChange = new Emitter<void>();
  private readonly scope: string;
  private entries: KnowledgeEntry[] = [];
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(
    @IWorkspaceContext private readonly ctx: IWorkspaceContext,
    @IAtomicDocumentStore private readonly store: IAtomicDocumentStore,
    @ILogService private readonly log: ILogService,
  ) {
    super();
    this.onDidChange = this._onDidChange.event;
    this.scope = `${ctx.persistenceScope}/knowledge`;
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      const existing = await this.store.get<KnowledgeDocument>(this.scope, DOC_KEY);
      this.entries = (existing?.entries ?? []).map(normalizeEntry);
    } catch (error) {
      this.log.warn('failed to load workspace knowledge; starting empty', {
        workspaceId: this.ctx.workspaceId,
        error: error instanceof Error ? error.message : String(error),
      });
      this.entries = [];
    }
  }

  private async persist(): Promise<void> {
    const doc: KnowledgeDocument = { version: 1, entries: this.entries };
    await this.store.set(this.scope, DOC_KEY, doc);
  }

  private enqueueWrite(apply: () => void | Promise<void>): Promise<void> {
    const next = this.writeQueue.then(async () => {
      await apply();
      await this.persist();
    });
    this.writeQueue = next.catch(() => {
      /* keep the queue alive after a failed write */
    });
    return next;
  }

  async list(): Promise<readonly KnowledgeEntry[]> {
    await this.ready;
    return this.entries;
  }

  async getEntry(id: string): Promise<KnowledgeEntry | undefined> {
    await this.ready;
    return this.entries.find((e) => e.id === id);
  }

  async upsert(input: KnowledgeInput, id?: string): Promise<KnowledgeEntry> {
    await this.ready;
    if (input.content.trim().length > CONTENT_MAX_LENGTH) {
      throw new Error(
        `Knowledge content exceeds the ${CONTENT_MAX_LENGTH}-character limit.`,
      );
    }
    const now = new Date().toISOString();
    let entry: KnowledgeEntry;
    if (id !== undefined) {
      const existing = this.entries.find((e) => e.id === id);
      if (existing === undefined) {
        throw new Error(`Knowledge entry not found: ${id}`);
      }
      entry = normalizeEntry({
        ...existing,
        name: input.name.trim(),
        useWhen: input.useWhen.trim(),
        content: input.content.trim(),
        tags: input.tags ?? existing.tags,
        active: input.active ?? existing.active,
        updatedAt: now,
      });
      await this.enqueueWrite(() => {
        this.entries = this.entries.map((e) => (e.id === id ? entry : e));
      });
    } else {
      entry = normalizeEntry({
        id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: input.name.trim(),
        useWhen: input.useWhen.trim(),
        content: input.content.trim(),
        tags: input.tags ?? [],
        active: input.active !== false,
        createdAt: now,
        updatedAt: now,
      });
      await this.enqueueWrite(() => {
        this.entries = [...this.entries, entry];
      });
    }
    this.log.debug('knowledge entry upserted', {
      workspaceId: this.ctx.workspaceId,
      knowledgeId: entry.id,
    });
    this._onDidChange.fire();
    return entry;
  }

  async remove(id: string): Promise<boolean> {
    await this.ready;
    if (!this.entries.some((e) => e.id === id)) return false;
    await this.enqueueWrite(() => {
      this.entries = this.entries.filter((e) => e.id !== id);
    });
    this.log.debug('knowledge entry removed', {
      workspaceId: this.ctx.workspaceId,
      knowledgeId: id,
    });
    this._onDidChange.fire();
    return true;
  }

  async getSystemPromptBlock(): Promise<string> {
    await this.ready;
    const active = this.entries.filter((e) => e.active);
    if (active.length === 0) return '';
    return [
      '## Knowledge — User Preferences (MUST FOLLOW)',
      '',
      'The following are durable user preferences. Apply them in EVERY response',
      'when the "use when" condition matches. These override default behavior.',
      '',
      ...active.map(entryToBlock),
      '',
    ].join('\n');
  }
}

registerScopedService(
  LifecycleScope.Workspace,
  IWorkspaceKnowledgeService,
  WorkspaceKnowledgeService,
  ScopeActivation.OnScopeCreated,
  'workspaceKnowledge',
);
