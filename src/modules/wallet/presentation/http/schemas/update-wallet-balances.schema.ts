import { z } from 'zod';

function walletBalanceSchema(field: string) {
  return z.coerce
    .number({
      error: `${field} must be a valid number`,
    })
    .min(0, `${field} must be greater than or equal to 0`)
    .refine((value) => Number.isInteger(value * 100), {
      error: `${field} must have at most 2 decimal places`,
    })
    .refine((value) => value <= 999999999999.99, {
      error: `${field} exceeds the allowed limit`,
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
