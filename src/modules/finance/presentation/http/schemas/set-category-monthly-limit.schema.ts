import { z } from 'zod';

import { moneyAmountSchema } from '@/shared/presentation/http/schemas/money-amount.schema';

// null removes the goal. It is matched before the money schema because
// z.coerce would turn null into 0.
export const setCategoryMonthlyLimitSchema = z.object({
  monthlyLimit: z.union([z.null(), moneyAmountSchema]),
});

export type SetCategoryMonthlyLimitSchemaData = z.infer<
  typeof setCategoryMonthlyLimitSchema
>;
