/**
 * `workspaceKnowledge` domain — `IWorkspaceKnowledgeService` contract.
 *
 * Durable user/project knowledge per workspace: small named preferences the
 * agent recalls during conversations (e.g. "Always use Hinglish"). Each entry
 * carries a `useWhen` trigger description and `content` (max 2000 chars). The
 * service persists one atomic document (`entries.json`) under the workspace
 * handler's `persistenceScope` and renders the active entries as a system
 * prompt block. Bound at Workspace scope.
 */

import { createDecorator, type ServiceIdentifier } from '#/_base/di/instantiation';

export interface KnowledgeEntry {
  readonly id: string;
  readonly name: string;
  readonly useWhen: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KnowledgeInput {
  readonly name: string;
  readonly useWhen: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly active?: boolean;
}

export interface IWorkspaceKnowledgeService {
  readonly _serviceBrand: undefined;

  readonly ready: Promise<void>;

  list(): Promise<readonly KnowledgeEntry[]>;
  getEntry(id: string): Promise<KnowledgeEntry | undefined>;
  upsert(input: KnowledgeInput, id?: string): Promise<KnowledgeEntry>;
  remove(id: string): Promise<boolean>;

  /**
   * Renders the active entries as a `## Knowledge` markdown block for system
   * prompt injection (empty string when there are no active entries).
   */
  getSystemPromptBlock(): Promise<string>;
}

export const IWorkspaceKnowledgeService: ServiceIdentifier<IWorkspaceKnowledgeService> =
  createDecorator<IWorkspaceKnowledgeService>('workspaceKnowledgeService');
