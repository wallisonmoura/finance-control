import { z } from 'zod';

export const financeAmountSchema = z.coerce
  .number({
    error: 'Valor deve ser numérico.',
  })
  .positive({
    error: 'Valor deve ser maior que zero.',
  })
  .refine((value) => Number.isInteger(value * 100), {
    error: 'Valor deve ter no máximo 2 casas decimais.',
  })
  .refine((value) => value <= 999999999999.99, {
    error: 'Valor excede o limite permitido.',
  });
