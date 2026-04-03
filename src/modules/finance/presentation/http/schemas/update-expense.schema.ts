import { z } from 'zod';

import { financeAmountSchema } from './shared/finance-amount.schema';
import { financeDateSchema } from './shared/finance-date.schema';

export const updateExpenseSchema = z
  .object({
    amount: financeAmountSchema,
    description: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? 'Descrição é obrigatória.'
            : 'Descrição deve ser uma string.',
      })
      .trim()
      .min(1, {
        error: 'Descrição é obrigatória.',
      })
      .max(255, {
        error: 'Descrição deve ter no máximo 255 caracteres.',
      }),
    date: financeDateSchema,
    categoryId: z.uuid({
      error: (issue) =>
        issue.input === undefined
          ? 'Categoria é obrigatória para despesa.'
          : 'Categoria deve ser um UUID válido.',
    }),
    notes: z
      .string({
        error: 'Observações devem ser uma string.',
      })
      .trim()
      .max(1000, {
        error: 'Observações devem ter no máximo 1000 caracteres.',
      })
      .optional(),
  })
  .strict();

export type UpdateExpenseSchemaData = z.infer<typeof updateExpenseSchema>;
