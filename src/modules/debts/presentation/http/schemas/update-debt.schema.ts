import { z } from 'zod';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { debtAmountSchema } from './shared/debt-amount.schema';
import { debtDateSchema } from './shared/debt-date.schema';

export const updateDebtSchema = z
  .object({
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
    amount: debtAmountSchema,
    dueDate: debtDateSchema,
    // Unlike registerDebtSchema, INSTALLMENT is accepted here: editing an
    // already-existing installment row must be able to preserve its type
    // unchanged (see DebtForm's isEditingInstallment) — it's never something
    // a user picks from scratch, only something that round-trips.
    type: z.enum(DebtType, {
      error: 'Tipo de dívida inválido.',
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

export type UpdateDebtSchemaData = z.infer<typeof updateDebtSchema>;
