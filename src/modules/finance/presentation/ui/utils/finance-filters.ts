import { z } from 'zod';

import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

import {
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';

type FinanceHistoryInitialFilters = Partial<FinanceHistoryFiltersUi>;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Mesmo validador usado por getTransactionHistoryQuerySchema, para que a UI
// nunca envie à API um categoryId que ela vá rejeitar com 400.
const categoryIdSchema = z.uuid();

export function getCurrentMonthFilters(
  initialFilters?: FinanceHistoryInitialFilters,
): FinanceHistoryFiltersUi {
  const [year, month] = getCurrentBusinessDateValue()
    .split('-')
    .map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, 1))
    .toISOString()
    .slice(0, 10);

  const endDate = new Date(Date.UTC(year, month, 0))
    .toISOString()
    .slice(0, 10);

  return {
    startDate,
    endDate,
    page: 1,
    ...initialFilters,
  };
}

// Coerce/parse com segurança: um valor ausente, não-numérico, fracionário
// ou menor que 1 sempre volta para a página 1, nunca lança nem produz NaN.
function parsePageValue(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function getFirstSearchParamValue(
  searchParams: SearchParamsRecord,
  key: string,
): string | null {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function isValidDateOnly(value: string | null): value is string {
  if (!value || !DATE_ONLY_REGEX.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidFinanceEntryType(
  value: string | null,
): value is FinanceEntryTypeUi {
  return value === 'INCOME' || value === 'EXPENSE';
}

export function isValidCategoryId(value: string | null): value is string {
  return categoryIdSchema.safeParse(value).success;
}

export function getFinanceHistoryFiltersFromUrlSearchParams(
  searchParams: URLSearchParams,
): FinanceHistoryFiltersUi {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type');
  const categoryId = searchParams.get('categoryId');
  const page = parsePageValue(searchParams.get('page'));

  return getCurrentMonthFilters({
    ...(isValidDateOnly(startDate) ? { startDate } : {}),
    ...(isValidDateOnly(endDate) ? { endDate } : {}),
    ...(isValidFinanceEntryType(type) ? { type } : {}),
    ...(isValidCategoryId(categoryId) ? { categoryId } : {}),
    page,
  });
}

export function getFinanceHistoryFiltersFromSearchParamsRecord(
  searchParams: SearchParamsRecord,
): FinanceHistoryFiltersUi {
  const startDate = getFirstSearchParamValue(searchParams, 'startDate');
  const endDate = getFirstSearchParamValue(searchParams, 'endDate');
  const type = getFirstSearchParamValue(searchParams, 'type');
  const categoryId = getFirstSearchParamValue(searchParams, 'categoryId');
  const page = parsePageValue(getFirstSearchParamValue(searchParams, 'page'));

  return getCurrentMonthFilters({
    ...(isValidDateOnly(startDate) ? { startDate } : {}),
    ...(isValidDateOnly(endDate) ? { endDate } : {}),
    ...(isValidFinanceEntryType(type) ? { type } : {}),
    ...(isValidCategoryId(categoryId) ? { categoryId } : {}),
    page,
  });
}
