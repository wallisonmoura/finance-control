import { z } from 'zod';

import { isoDateStringSchema } from './shared/date-query.schema';

export const getDailyTransactionsQuerySchema = z.object({
  date: isoDateStringSchema,
});

export type GetDailyTransactionsQuery = z.infer<
  typeof getDailyTransactionsQuerySchema
>;
