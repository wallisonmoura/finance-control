import { z } from 'zod';

function hasAtMostTwoDecimalPlaces(value: number) {
  return /^\d+(\.\d{1,2})?$/.test(value.toString());
}

function walletBalanceSchema(field: string) {
  return z.coerce
    .number({
      error: `${field} deve ser um número válido.`,
    })
    .min(0, `${field} deve ser maior ou igual a 0.`)
    .refine(hasAtMostTwoDecimalPlaces, {
      error: `${field} deve ter no máximo 2 casas decimais.`,
    })
    .refine((value) => value <= 999999999999.99, {
      error: `${field} excede o limite permitido.`,
    });
}

export const updateWalletBalancesBodySchema = z
  .object({
    bankBalance: walletBalanceSchema('bankBalance'),
    cashBalance: walletBalanceSchema('cashBalance'),
    receivableBalance: walletBalanceSchema('receivableBalance'),
  })
  .strict();

export type UpdateWalletBalancesBodySchema = z.infer<
  typeof updateWalletBalancesBodySchema
>;
