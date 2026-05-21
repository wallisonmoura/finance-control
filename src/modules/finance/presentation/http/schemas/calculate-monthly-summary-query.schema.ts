import { z } from 'zod';

export const calculateMonthlySummaryQuerySchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos.'),
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'Mês deve estar entre 1 e 12.'),
});

export type CalculateMonthlySummaryQuery = z.infer<
  typeof calculateMonthlySummaryQuerySchema
>;
