import { z } from 'zod';

export const debtIdParamSchema = z.object({
  id: z.uuid({
    error: 'Id inválido.',
  }),
});

export type DebtIdParamSchemaData = z.infer<typeof debtIdParamSchema>;
