/**
 * `tools` domain — `IKnowledgeTool` contract (the `Knowledge` tool).
 *
 * Public contract of the durable-knowledge tool. One action discriminator
 * serves all operations:
 *
 *   - `{ action: 'list' }`                      — recall stored entries
 *   - `{ action: 'add', name, useWhen, content }` — save a new entry
 *   - `{ action: 'update', id, ... }`           — revise an existing entry
 *   - `{ action: 'remove', id }`                — delete an entry
 *
 * Exports the model-facing `KnowledgeToolInputSchema` / `KnowledgeToolInput`
 * and the `IKnowledgeTool` DI decorator. Bound at Agent scope.
 */

import { z } from 'zod';

import { createDecorator } from '#/_base/di/instantiation';
import { type AgentTool } from '#/tool/toolContract';

const BaseFields = {
  name: z
    .string()
    .min(1)
    .max(100)
    .describe('Short label for this knowledge entry, e.g. "Language preference".'),
  useWhen: z
    .string()
    .max(200)
    .describe('When this knowledge applies, e.g. "Whenever communicating with the user".'),
  content: z
    .string()
    .min(1)
    .max(2000)
    .describe('The durable instruction or fact, written as a rule.'),
};

export type KnowledgeToolInput =
  | { readonly action: 'list' }
  | {
      readonly action: 'add';
      readonly name: string;
      readonly useWhen: string;
      readonly content: string;
    }
  | {
      readonly action: 'update';
      readonly id: string;
      readonly name?: string;
      readonly useWhen?: string;
      readonly content?: string;
    }
  | { readonly action: 'remove'; readonly id: string };

export const KnowledgeToolInputSchema: z.ZodType<KnowledgeToolInput> = z.discriminatedUnion(
  'action',
  [
    z.object({ action: z.literal('list') }),
    z.object({
      action: z.literal('add'),
      name: BaseFields.name,
      useWhen: BaseFields.useWhen,
      content: BaseFields.content,
    }),
    z.object({
      action: z.literal('update'),
      id: z.string().min(1).describe('The knowledge entry id to update.'),
      name: BaseFields.name.optional(),
      useWhen: BaseFields.useWhen.optional(),
      content: BaseFields.content.optional(),
    }),
    z.object({
      action: z.literal('remove'),
      id: z.string().min(1).describe('The knowledge entry id to delete.'),
    }),
  ],
);

export interface IKnowledgeTool extends AgentTool<KnowledgeToolInput> {
  readonly _serviceBrand: undefined;
}
export const IKnowledgeTool = createDecorator<IKnowledgeTool>('knowledgeTool');
