import { z } from 'zod';

export const financialEntryIdParamSchema = z.object({
  id: z.uuid(),
});

export type FinancialEntryIdParamSchemaData = z.infer<
  typeof financialEntryIdParamSchema
>;
