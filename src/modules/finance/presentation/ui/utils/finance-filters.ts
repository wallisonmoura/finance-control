import {
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';

type FinanceHistoryInitialFilters = Partial<FinanceHistoryFiltersUi>;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function getCurrentMonthFilters(
  initialFilters?: FinanceHistoryInitialFilters,
): FinanceHistoryFiltersUi {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(Date.UTC(year, month, 1))
    .toISOString()
    .slice(0, 10);

  const endDate = new Date(Date.UTC(year, month + 1, 0))
    .toISOString()
    .slice(0, 10);

  return {
    startDate,
    endDate,
    ...initialFilters,
  };
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

export function getFinanceHistoryFiltersFromUrlSearchParams(
  searchParams: URLSearchParams,
): FinanceHistoryFiltersUi {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type');

  return getCurrentMonthFilters({
    ...(isValidDateOnly(startDate) ? { startDate } : {}),
    ...(isValidDateOnly(endDate) ? { endDate } : {}),
    ...(isValidFinanceEntryType(type) ? { type } : {}),
  });
}

export function getFinanceHistoryFiltersFromSearchParamsRecord(
  searchParams: SearchParamsRecord,
): FinanceHistoryFiltersUi {
  const startDate = getFirstSearchParamValue(searchParams, 'startDate');
  const endDate = getFirstSearchParamValue(searchParams, 'endDate');
  const type = getFirstSearchParamValue(searchParams, 'type');

  return getCurrentMonthFilters({
    ...(isValidDateOnly(startDate) ? { startDate } : {}),
    ...(isValidDateOnly(endDate) ? { endDate } : {}),
    ...(isValidFinanceEntryType(type) ? { type } : {}),
  });
}
