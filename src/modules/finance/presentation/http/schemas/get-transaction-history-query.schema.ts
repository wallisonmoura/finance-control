import { z } from 'zod';

import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';

import { isoDateStringSchema } from './shared/date-query.schema';

// Limite superior de pageSize: pessoal/single-tenant hoje, mas evita que uma
// chamada mal formada peça a tabela inteira de uma vez, contornando de fato
// a paginação que este endpoint existe para ter.
const MAX_PAGE_SIZE = 100;

export const getTransactionHistoryQuerySchema = z
  .object({
    startDate: isoDateStringSchema,
    endDate: isoDateStringSchema,
    type: z.enum(FinancialEntryType).optional(),
    categoryId: z.uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(20),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Data inicial deve ser menor ou igual à data final.',
    path: ['startDate'],
  });

export type GetTransactionHistoryQuery = z.infer<
  typeof getTransactionHistoryQuerySchema
>;
