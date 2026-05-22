import { FinanceEntryUi } from '../types/finance-ui.types';

type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type FinanceOperationalSummaryFilters = {
  year: number;
  month: number;
};

export type FinanceOperationalSummaryDailyRow = {
  date: string;
  day: number;
  totalIncome: number;
  totalExpense: number;
  result: number;
};

function toDateOnly(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
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

const MONTH_ONLY_REGEX = /^\d{4}-\d{2}$/;

export function getCurrentOperationalSummaryFilters(): FinanceOperationalSummaryFilters {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function toMonthInputValue(filters: FinanceOperationalSummaryFilters) {
  return `${filters.year}-${String(filters.month).padStart(2, '0')}`;
}

export function parseMonthInputValue(
  value: string,
): FinanceOperationalSummaryFilters {
  const [year, month] = value.split('-').map(Number);

  return {
    year,
    month,
  };
}

export function isValidMonthOnly(value: string | null): value is string {
  if (!value || !MONTH_ONLY_REGEX.test(value)) {
    return false;
  }

  const { year, month } = parseMonthInputValue(value);

  return Number.isInteger(year) && month >= 1 && month <= 12;
}

export function getOperationalSummaryFiltersFromUrlSearchParams(
  searchParams: URLSearchParams,
): FinanceOperationalSummaryFilters {
  const month = searchParams.get('month');

  if (!isValidMonthOnly(month)) {
    return getCurrentOperationalSummaryFilters();
  }

  return parseMonthInputValue(month);
}

export function getOperationalSummaryFiltersFromSearchParamsRecord(
  searchParams: SearchParamsRecord,
): FinanceOperationalSummaryFilters {
  const month = getFirstSearchParamValue(searchParams, 'month');

  if (!isValidMonthOnly(month)) {
    return getCurrentOperationalSummaryFilters();
  }

  return parseMonthInputValue(month);
}

export function getOperationalSummaryPeriod(
  filters: FinanceOperationalSummaryFilters,
) {
  const lastDay = getLastDayOfMonth(filters.year, filters.month);

  return {
    startDate: toDateOnly(filters.year, filters.month, 1),
    endDate: toDateOnly(filters.year, filters.month, lastDay),
    lastDay,
  };
}

export function buildOperationalSummaryDailyRows(
  filters: FinanceOperationalSummaryFilters,
  entries: FinanceEntryUi[],
): FinanceOperationalSummaryDailyRow[] {
  const { lastDay } = getOperationalSummaryPeriod(filters);
  const rows = new Map<string, FinanceOperationalSummaryDailyRow>();

  for (let day = 1; day <= lastDay; day += 1) {
    const date = toDateOnly(filters.year, filters.month, day);

    rows.set(date, {
      date,
      day,
      totalIncome: 0,
      totalExpense: 0,
      result: 0,
    });
  }

  for (const entry of entries) {
    const date = entry.date.slice(0, 10);
    const row = rows.get(date);

    if (!row) {
      continue;
    }

    if (entry.type === 'INCOME') {
      row.totalIncome += entry.amount;
    } else {
      row.totalExpense += entry.amount;
    }

    row.result = row.totalIncome - row.totalExpense;
  }

  return [...rows.values()];
}
