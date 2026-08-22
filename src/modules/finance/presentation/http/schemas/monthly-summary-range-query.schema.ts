import { z } from 'zod';

export const monthlySummaryRangeQuerySchema = z.object({
  months: z.coerce
    .number({
      error: 'Quantidade de meses deve ser numérica.',
    })
    .int({
      error: 'Quantidade de meses deve ser um número inteiro.',
    })
    .min(1, {
      error: 'Quantidade de meses deve ser no mínimo 1.',
    })
    .max(24, {
      error: 'Quantidade de meses deve ser no máximo 24.',
    })
    .default(6),
});

export type MonthlySummaryRangeQuery = z.infer<
  typeof monthlySummaryRangeQuerySchema
>;
