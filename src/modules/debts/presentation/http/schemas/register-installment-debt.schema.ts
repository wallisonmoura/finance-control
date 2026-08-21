import { z } from 'zod';
import { debtAmountSchema } from './shared/debt-amount.schema';
import { debtDateSchema } from './shared/debt-date.schema';

export const registerInstallmentDebtSchema = z
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
    installmentCount: z.coerce
      .number({
        error: 'Número de parcelas deve ser numérico.',
      })
      .int({
        error: 'Número de parcelas deve ser um número inteiro.',
      })
      .min(2, {
        error: 'Número de parcelas deve ser no mínimo 2.',
      })
      .max(12, {
        error: 'Número de parcelas deve ser no máximo 12.',
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

export type RegisterInstallmentDebtSchemaData = z.infer<
  typeof registerInstallmentDebtSchema
>;
