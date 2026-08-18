import { z } from 'zod';

import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';

import { isoDateStringSchema } from './shared/date-query.schema';

// Sem page/pageSize: este endpoint sempre retorna o período inteiro (ver
// GetFullTransactionHistoryController), não existe contrato de paginação aqui.
export const getFullTransactionHistoryQuerySchema = z
  .object({
    startDate: isoDateStringSchema,
    endDate: isoDateStringSchema,
    type: z.enum(FinancialEntryType).optional(),
    categoryId: z.uuid().optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Data inicial deve ser menor ou igual à data final.',
    path: ['startDate'],
  });

export type GetFullTransactionHistoryQuery = z.infer<
  typeof getFullTransactionHistoryQuerySchema
>;
