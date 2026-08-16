/**
 *   GET    /v1/workspaces/{workspace_id}/knowledge
 *   POST   /v1/workspaces/{workspace_id}/knowledge
 *   PATCH  /v1/workspaces/{workspace_id}/knowledge/{knowledge_id}
 *   DELETE /v1/workspaces/{workspace_id}/knowledge/{knowledge_id}
 */

import { z } from 'zod';

export const knowledgeEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  use_when: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type KnowledgeEntry = z.infer<typeof knowledgeEntrySchema>;

export const knowledgeInputSchema = z.object({
  name: z.string().min(1).max(100),
  use_when: z.string().max(200),
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
export type KnowledgeInput = z.infer<typeof knowledgeInputSchema>;

export const knowledgeUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    use_when: z.string().max(200).optional(),
    content: z.string().min(1).max(2000).optional(),
    tags: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: 'at least one field must be provided',
  });
export type KnowledgeUpdate = z.infer<typeof knowledgeUpdateSchema>;

export const knowledgeIdParamSchema = z.object({
  knowledge_id: z.string().min(1),
});
export type KnowledgeIdParam = z.infer<typeof knowledgeIdParamSchema>;

export const listKnowledgeResponseSchema = z.object({
  items: z.array(knowledgeEntrySchema),
});
export type ListKnowledgeResponse = z.infer<typeof listKnowledgeResponseSchema>;

export const createKnowledgeResponseSchema = knowledgeEntrySchema;
export type CreateKnowledgeResponse = z.infer<typeof createKnowledgeResponseSchema>;

export const updateKnowledgeResponseSchema = knowledgeEntrySchema;
export type UpdateKnowledgeResponse = z.infer<typeof updateKnowledgeResponseSchema>;

export const deleteKnowledgeResponseSchema = z.object({
  deleted: z.literal(true),
});
export type DeleteKnowledgeResponse = z.infer<typeof deleteKnowledgeResponseSchema>;
