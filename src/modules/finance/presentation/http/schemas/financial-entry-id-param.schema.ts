import { z } from 'zod';

export const financialEntryIdParamSchema = z.object({
  id: z.uuid({
    error: 'Id inválido.',
  }),
});

export type FinancialEntryIdParamSchemaData = z.infer<
  typeof financialEntryIdParamSchema
>;
