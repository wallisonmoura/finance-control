import { z } from 'zod';

export const expenseCategoryIdParamSchema = z.object({
  id: z.uuid({
    error: 'Id inválido.',
  }),
});

export type ExpenseCategoryIdParamSchemaData = z.infer<
  typeof expenseCategoryIdParamSchema
>;
