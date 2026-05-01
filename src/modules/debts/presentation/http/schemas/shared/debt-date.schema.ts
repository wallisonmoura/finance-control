import { z } from 'zod';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

export const debtDateSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? 'Data é obrigatória.'
        : 'Data deve ser uma string.',
  })
  .trim()
  .refine((value) => DATE_ONLY_REGEX.test(value), {
    error: 'Data deve estar no formato YYYY-MM-DD.',
  })
  .refine(isValidDateOnly, {
    error: 'Data inválida.',
  });
