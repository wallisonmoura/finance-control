import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { dateOnlySchema } from './date-only.schema';

function isNotInTheFuture(value: string): boolean {
  return value <= getCurrentBusinessDateValue();
}

/**
 * `dateOnlySchema` plus a rule that rejects dates after today, in the
 * product's business timezone (America/Sao_Paulo). Use for dates that
 * represent an already-realized event — an income/expense's date, a debt
 * payment's date — never for dates that are inherently future-facing, like
 * a debt's `dueDate`.
 */
export const notFutureDateSchema = dateOnlySchema.refine(isNotInTheFuture, {
  error: 'Data não pode ser uma data futura.',
});
