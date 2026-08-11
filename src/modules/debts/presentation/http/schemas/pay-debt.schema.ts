import { z } from 'zod';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { debtPaymentDateSchema } from './shared/debt-payment-date.schema';

export const payDebtSchema = z
  .object({
    paidAt: debtPaymentDateSchema,
    expenseCategoryId: z.uuid({
      error: 'Categoria de despesa inválida.',
    }),
    paymentSource: z.enum(DebtPaymentSource, {
      error: 'Origem do pagamento inválida.',
    }),
  })
  .strict();

export type PayDebtSchemaData = z.infer<typeof payDebtSchema>;
