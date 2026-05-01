import { z } from 'zod';

export const debtIdParamSchema = z.object({
  id: z.uuid(),
});

export type DebtIdParamSchemaData = z.infer<typeof debtIdParamSchema>;
