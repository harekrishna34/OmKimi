/**
 * `tools` domain — `KnowledgeTool` implementation (the `Knowledge` tool).
 *
 * Reads and writes the workspace knowledge store through
 * `IWorkspaceKnowledgeService` (`workspaceKnowledge` domain), which persists
 * every change as one atomic document per workspace. The service is observed
 * through `@ref` (not a hard dependency) so hosts without a workspace layer
 * still construct the tool — calls there report the store as unavailable.
 * Every mutation returns a human-readable summary so the agent can confirm
 * what changed.
 *
 * Registered via the module-level `registerAgentToolService(IKnowledgeTool,
 * KnowledgeTool)` at the bottom of this file — the same "import = register"
 * pattern used by every agent tool. `AgentToolActivationService` activates it
 * per agent when the profile allows (resolving the Workspace-scope
 * `IWorkspaceKnowledgeService` from the parent scope). Bound at Agent scope.
 */

import type { ToolExecution } from '#/tool/toolContract';
import { registerAgentToolService } from '#/agent/toolRegistry/toolContribution';
import { toInputJsonSchema } from '#/tool/input-schema';
import { ref, type LiveRef } from '#/_base/di/instantiation';

import { IWorkspaceKnowledgeService } from '#/workspace/workspaceKnowledge/workspaceKnowledge';

import {
  IKnowledgeTool,
  KnowledgeToolInputSchema,
  type KnowledgeToolInput,
} from './knowledge';
import DESCRIPTION from './knowledge.md?raw';

export const KNOWLEDGE_TOOL_NAME = 'Knowledge' as const;

export class KnowledgeTool implements IKnowledgeTool {
  declare readonly _serviceBrand: undefined;
  readonly name = KNOWLEDGE_TOOL_NAME;
  readonly description: string = DESCRIPTION;
  readonly parameters: Record<string, unknown> = toInputJsonSchema(
    KnowledgeToolInputSchema,
  );

  constructor(
    @ref(IWorkspaceKnowledgeService)
    private readonly knowledge: LiveRef<IWorkspaceKnowledgeService>,
  ) {}

  resolveExecution(args: KnowledgeToolInput): ToolExecution {
    const description =
      args.action === 'list'
        ? 'Reading knowledge'
        : args.action === 'add'
          ? 'Saving knowledge'
          : args.action === 'update'
            ? 'Updating knowledge'
            : 'Removing knowledge';
    return {
      description,
      approvalRule: this.name,
      execute: async () => {
        const service = this.knowledge.current;
        if (service === undefined) {
          return {
            isError: true,
            output: 'The knowledge store is not available in this environment.',
          };
        }
        switch (args.action) {
          case 'list': {
            const entries = await service.list();
            if (entries.length === 0) {
              return { isError: false, output: 'No knowledge entries stored yet.' };
            }
            const lines = entries.map((e) => {
              const state = e.active ? '' : ' (inactive)';
              return `- [${e.id}] ${e.name}${state} — use when: ${e.useWhen || 'always'}\n  ${e.content}`;
            });
            return {
              isError: false,
              output: `Knowledge entries (${entries.length}):\n${lines.join('\n')}`,
            };
          }
          case 'add': {
            const entry = await service.upsert({
              name: args.name,
              useWhen: args.useWhen,
              content: args.content,
            });
            return {
              isError: false,
              output: `Knowledge saved.\n- [${entry.id}] ${entry.name} — use when: ${entry.useWhen || 'always'}\n  ${entry.content}`,
            };
          }
          case 'update': {
            const existing = await service.getEntry(args.id);
            if (existing === undefined) {
              return {
                isError: true,
                output: `Knowledge entry not found: ${args.id}. Use action "list" to see stored ids.`,
              };
            }
            const entry = await service.upsert(
              {
                name: args.name ?? existing.name,
                useWhen: args.useWhen ?? existing.useWhen,
                content: args.content ?? existing.content,
                tags: existing.tags,
                active: existing.active,
              },
              args.id,
            );
            return {
              isError: false,
              output: `Knowledge updated.\n- [${entry.id}] ${entry.name} — use when: ${entry.useWhen || 'always'}\n  ${entry.content}`,
            };
          }
          case 'remove': {
            const removed = await service.remove(args.id);
            if (!removed) {
              return {
                isError: true,
                output: `Knowledge entry not found: ${args.id}. Use action "list" to see stored ids.`,
              };
            }
            return { isError: false, output: `Knowledge entry removed: ${args.id}` };
          }
        }
      },
    };
  }
}

registerAgentToolService(IKnowledgeTool, KnowledgeTool, {
  name: KNOWLEDGE_TOOL_NAME,
  domain: 'knowledge',
});
