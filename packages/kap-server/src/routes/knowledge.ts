/**
 * `/workspaces/{workspace_id}/knowledge` route handlers.
 *
 * Implements the v1 wire contract for the durable per-workspace knowledge
 * store on top of the Workspace-scope `IWorkspaceKnowledgeService`
 * (`workspaceKnowledge` domain in `agent-core-v2`). Every route resolves the
 * workspace's live handler (`IWorkspaceLifecycleService.handlerFor`,
 * materializing it on demand) and reaches the service through the handler's
 * accessor — the same path the trust routes use.
 *
 *   GET    /workspaces/{workspace_id}/knowledge           list
 *   POST   /workspaces/{workspace_id}/knowledge           create
 *   PATCH  /workspaces/{workspace_id}/knowledge/{knowledge_id}  update
 *   DELETE /workspaces/{workspace_id}/knowledge/{knowledge_id}  remove
 */

import {
  IWorkspaceKnowledgeService,
  IWorkspaceLifecycleService,
  IWorkspaceService,
  type KnowledgeEntry,
  type Scope,
} from '@moonshot-ai/agent-core-v2';

import { z } from 'zod';

import { errEnvelope, okEnvelope } from '../envelope';
import { defineRoute } from '../middleware/defineRoute';
import { ErrorCode } from '../protocol/error-codes';
import {
  createKnowledgeResponseSchema,
  deleteKnowledgeResponseSchema,
  knowledgeEntrySchema,
  knowledgeIdParamSchema,
  knowledgeInputSchema,
  knowledgeUpdateSchema,
  listKnowledgeResponseSchema,
  updateKnowledgeResponseSchema,
} from '../protocol/rest-knowledge';
import { workspaceIdParamSchema } from '../protocol/rest-workspace';

interface KnowledgeRouteHost {
  get(
    path: string,
    options: { preHandler: unknown[]; schema?: Record<string, unknown> } | undefined,
    handler: (
      req: { id: string; params: unknown },
      reply: { send(payload: unknown): unknown },
    ) => Promise<void> | void,
  ): unknown;
  post(
    path: string,
    options: { preHandler: unknown[]; schema?: Record<string, unknown> },
    handler: (
      req: { id: string; body: unknown; params: unknown },
      reply: { send(payload: unknown): unknown },
    ) => Promise<void> | void,
  ): unknown;
  patch(
    path: string,
    options: { preHandler: unknown[]; schema?: Record<string, unknown> },
    handler: (
      req: { id: string; body: unknown; params: unknown },
      reply: { send(payload: unknown): unknown },
    ) => Promise<void> | void,
  ): unknown;
  delete(
    path: string,
    options: { preHandler: unknown[]; schema?: Record<string, unknown> } | undefined,
    handler: (
      req: { id: string; params: unknown },
      reply: { send(payload: unknown): unknown },
    ) => Promise<void> | void,
  ): unknown;
}

const detailsSchema = z.array(z.object({ path: z.string(), message: z.string() }));
const knowledgeIdAndWorkspaceIdParamSchema = workspaceIdParamSchema.merge(knowledgeIdParamSchema);

type KnowledgeReply = { send(payload: unknown): unknown };

async function resolveKnowledge(
  core: Scope,
  workspaceId: string,
  requestId: string,
  reply: KnowledgeReply,
): Promise<IWorkspaceKnowledgeService | undefined> {
  const ws = await core.accessor.get(IWorkspaceService).get(workspaceId);
  if (ws === undefined) {
    reply.send(
      errEnvelope(
        ErrorCode.WORKSPACE_NOT_FOUND,
        `workspace ${workspaceId} does not exist`,
        requestId,
      ),
    );
    return undefined;
  }
  const handle = await core
    .accessor.get(IWorkspaceLifecycleService)
    .handlerFor({ workspaceId, root: ws.root });
  return handle.accessor.get(IWorkspaceKnowledgeService);
}

function toWireKnowledge(entry: KnowledgeEntry): z.infer<typeof knowledgeEntrySchema> {
  return {
    id: entry.id,
    name: entry.name,
    use_when: entry.useWhen,
    content: entry.content,
    tags: entry.tags !== undefined ? [...entry.tags] : undefined,
    active: entry.active,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

export function registerKnowledgeRoutes(app: KnowledgeRouteHost, core: Scope): void {
  const listRoute = defineRoute(
    {
      method: 'GET',
      path: '/workspaces/{workspace_id}/knowledge',
      params: workspaceIdParamSchema,
      success: { data: listKnowledgeResponseSchema },
      errors: { [ErrorCode.WORKSPACE_NOT_FOUND]: {} },
      description: 'List knowledge entries for a workspace',
      tags: ['knowledge'],
    },
    async (req, reply) => {
      const knowledge = await resolveKnowledge(core, req.params.workspace_id, req.id, reply);
      if (knowledge === undefined) return;
      const entries = await knowledge.list();
      reply.send(
        okEnvelope({ items: entries.map(toWireKnowledge) }, req.id),
      );
    },
  );
  app.get(listRoute.path, listRoute.options, listRoute.handler as Parameters<KnowledgeRouteHost['get']>[2]);

  const createRoute = defineRoute(
    {
      method: 'POST',
      path: '/workspaces/{workspace_id}/knowledge',
      params: workspaceIdParamSchema,
      body: knowledgeInputSchema,
      success: { data: createKnowledgeResponseSchema },
      errors: {
        [ErrorCode.WORKSPACE_NOT_FOUND]: {},
        [ErrorCode.VALIDATION_FAILED]: { detailsSchema },
      },
      description: 'Create a knowledge entry for a workspace',
      tags: ['knowledge'],
    },
    async (req, reply) => {
      const knowledge = await resolveKnowledge(core, req.params.workspace_id, req.id, reply);
      if (knowledge === undefined) return;
      const entry = await knowledge.upsert({
        name: req.body.name,
        useWhen: req.body.use_when,
        content: req.body.content,
        tags: req.body.tags,
        active: req.body.active,
      });
      reply.send(okEnvelope(toWireKnowledge(entry), req.id));
    },
  );
  app.post(
    createRoute.path,
    createRoute.options,
    createRoute.handler as Parameters<KnowledgeRouteHost['post']>[2],
  );

  const updateRoute = defineRoute(
    {
      method: 'PATCH',
      path: '/workspaces/{workspace_id}/knowledge/{knowledge_id}',
      params: knowledgeIdAndWorkspaceIdParamSchema,
      body: knowledgeUpdateSchema,
      success: { data: updateKnowledgeResponseSchema },
      errors: {
        [ErrorCode.WORKSPACE_NOT_FOUND]: {},
        [ErrorCode.VALIDATION_FAILED]: { detailsSchema },
      },
      description: 'Update a knowledge entry',
      tags: ['knowledge'],
    },
    async (req, reply) => {
      const knowledge = await resolveKnowledge(core, req.params.workspace_id, req.id, reply);
      if (knowledge === undefined) return;
      const existing = await knowledge.getEntry(req.params.knowledge_id);
      if (existing === undefined) {
        reply.send(
          errEnvelope(
            ErrorCode.VALIDATION_FAILED,
            `knowledge entry ${req.params.knowledge_id} does not exist`,
            req.id,
          ),
        );
        return;
      }
      const entry = await knowledge.upsert(
        {
          name: req.body.name ?? existing.name,
          useWhen: req.body.use_when ?? existing.useWhen,
          content: req.body.content ?? existing.content,
          tags: req.body.tags ?? existing.tags,
          active: req.body.active ?? existing.active,
        },
        existing.id,
      );
      reply.send(okEnvelope(toWireKnowledge(entry), req.id));
    },
  );
  app.patch(
    updateRoute.path,
    updateRoute.options,
    updateRoute.handler as Parameters<KnowledgeRouteHost['patch']>[2],
  );

  const deleteRoute = defineRoute(
    {
      method: 'DELETE',
      path: '/workspaces/{workspace_id}/knowledge/{knowledge_id}',
      params: knowledgeIdAndWorkspaceIdParamSchema,
      success: { data: deleteKnowledgeResponseSchema },
      errors: { [ErrorCode.WORKSPACE_NOT_FOUND]: {} },
      description: 'Delete a knowledge entry',
      tags: ['knowledge'],
    },
    async (req, reply) => {
      const knowledge = await resolveKnowledge(core, req.params.workspace_id, req.id, reply);
      if (knowledge === undefined) return;
      await knowledge.remove(req.params.knowledge_id);
      reply.send(okEnvelope({ deleted: true }, req.id));
    },
  );
  app.delete(
    deleteRoute.path,
    deleteRoute.options,
    deleteRoute.handler as Parameters<KnowledgeRouteHost['delete']>[2],
  );
}
