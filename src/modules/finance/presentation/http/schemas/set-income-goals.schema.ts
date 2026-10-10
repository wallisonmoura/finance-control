import { z } from 'zod';

import { moneyAmountSchema } from '@/shared/presentation/http/schemas/money-amount.schema';

// null clears that goal. It is matched before the money schema because
// z.coerce would turn null into 0. Both fields are required so a client
// always states the full desired state.
const targetSchema = z.union([z.null(), moneyAmountSchema]);

export const setIncomeGoalsSchema = z.object({
  revenueTarget: targetSchema,
  profitTarget: targetSchema,
});

export type SetIncomeGoalsSchemaData = z.infer<typeof setIncomeGoalsSchema>;
