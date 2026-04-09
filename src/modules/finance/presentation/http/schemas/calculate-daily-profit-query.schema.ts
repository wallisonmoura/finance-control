import { z } from 'zod';

import { isoDateStringSchema } from './shared/date-query.schema';

export const calculateDailyProfitQuerySchema = z.object({
  date: isoDateStringSchema,
});

export type CalculateDailyProfitQuery = z.infer<
  typeof calculateDailyProfitQuerySchema
>;
