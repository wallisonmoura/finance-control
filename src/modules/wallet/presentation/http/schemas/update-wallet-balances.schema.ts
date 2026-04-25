import { z } from 'zod';

export const updateWalletBalancesBodySchema = z.object({
  bankBalance: z.coerce
    .number({
      error: 'bankBalance must be a valid number',
    })
    .min(0, 'bankBalance must be greater than or equal to 0'),

  cashBalance: z.coerce
    .number({
      error: 'cashBalance must be a valid number',
    })
    .min(0, 'cashBalance must be greater than or equal to 0'),

  receivableBalance: z.coerce
    .number({
      error: 'receivableBalance must be a valid number',
    })
    .min(0, 'receivableBalance must be greater than or equal to 0'),
});

export type UpdateWalletBalancesBodySchema = z.infer<
  typeof updateWalletBalancesBodySchema
>;
