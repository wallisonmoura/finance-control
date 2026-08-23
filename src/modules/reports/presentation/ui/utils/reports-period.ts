import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

export const REPORTS_PERIOD_MONTH_OPTIONS = [3, 6, 12] as const;

export type ReportsPeriodMonths = (typeof REPORTS_PERIOD_MONTH_OPTIONS)[number];

export const DEFAULT_REPORTS_PERIOD_MONTHS: ReportsPeriodMonths = 6;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function isReportsPeriodMonths(value: number): value is ReportsPeriodMonths {
  return (REPORTS_PERIOD_MONTH_OPTIONS as readonly number[]).includes(value);
}

function parseReportsPeriodMonths(value: string | null): ReportsPeriodMonths {
  const parsed = Number(value);

  return isReportsPeriodMonths(parsed) ? parsed : DEFAULT_REPORTS_PERIOD_MONTHS;
}

export function getReportsMonthsFromUrlSearchParams(
  searchParams: URLSearchParams,
): ReportsPeriodMonths {
  return parseReportsPeriodMonths(searchParams.get('months'));
}

export function getReportsMonthsFromSearchParamsRecord(
  searchParams: SearchParamsRecord,
): ReportsPeriodMonths {
  const value = searchParams['months'];
  const first = Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

  return parseReportsPeriodMonths(first);
}

export type ReportsDateRange = {
  startDate: string;
  endDate: string;
};

// Mirrors the window math in CalculateMonthlySummaryRangeUseCase (backend,
// PR #67): oldestMonthIndex = currentMonth - 1 - (months - 1), 0-based.
export function getReportsDateRangeForMonths(
  months: ReportsPeriodMonths,
): ReportsDateRange {
  const [year, month] = getCurrentBusinessDateValue().split('-').map(Number);
  const oldestMonthIndex = month - 1 - (months - 1);

  const startDate = new Date(Date.UTC(year, oldestMonthIndex, 1))
    .toISOString()
    .slice(0, 10);
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return { startDate, endDate };
}

// Ascending 'YYYY-MM' keys for every month in the window, oldest first —
// used to zero-fill months with no data so charts keep monthly continuity.
export function getReportsMonthKeys(months: ReportsPeriodMonths): string[] {
  const [year, month] = getCurrentBusinessDateValue().split('-').map(Number);
  const oldestMonthIndex = month - 1 - (months - 1);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(year, oldestMonthIndex + index, 1));
    const monthNumber = String(date.getUTCMonth() + 1).padStart(2, '0');

    return `${date.getUTCFullYear()}-${monthNumber}`;
  });
}

export function formatReportsMonthLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '');
  const shortYear = String(year).slice(-2);

  return `${monthLabel}/${shortYear}`;
}
