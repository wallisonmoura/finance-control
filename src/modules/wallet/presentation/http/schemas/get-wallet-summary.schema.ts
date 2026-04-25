import { z } from 'zod';

export const getWalletSummaryQuerySchema = z.object({});
export type GetWalletSummaryQuerySchema = z.infer<
  typeof getWalletSummaryQuerySchema
>;
