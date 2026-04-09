import { z } from 'zod';

import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';

import { isoDateStringSchema } from './shared/date-query.schema';

export const getTransactionHistoryQuerySchema = z
  .object({
    startDate: isoDateStringSchema,
    endDate: isoDateStringSchema,
    type: z.enum(FinancialEntryType).optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be less than or equal to endDate',
    path: ['startDate'],
  });

export type GetTransactionHistoryQuery = z.infer<
  typeof getTransactionHistoryQuerySchema
>;
