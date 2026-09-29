export const INSIGHT_AVERAGE_MONTHS = 3;

export interface InsightMonth {
  year: number;
  month: number;
}

export interface ClosedMonthPeriod extends InsightMonth {
  start: Date;
  endExclusive: Date;
}

export interface InsightPeriods {
  currentStart: Date;
  currentEndExclusive: Date;
  comparisonStart: Date;
  comparisonEndExclusive: Date;
  comparisonMonth: InsightMonth;
  closedMonths: ClosedMonthPeriod[];
  queryStart: Date;
  queryEndExclusive: Date;
}

// Date.UTC normalizes negative/overflowing month and day values, rolling
// the year when needed (e.g. month -1 → December of the previous year).
function utcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function toInsightMonth(date: Date): InsightMonth {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

/**
 * All date ranges used by the monthly insights, derived from the business
 * "today" (YYYY-MM-DD). Ends are exclusive, matching
 * FinancialEntryRepository.findByUserIdAndPeriod's `lt: endDate`.
 *
 * The comparison period is the previous month up to the same day, so a
 * partial current month is never compared against a full month.
 */
export function getInsightPeriods(todayValue: string): InsightPeriods {
  const [year, month, day] = todayValue.split('-').map(Number);
  const monthIndex = month - 1;

  const currentStart = utcDate(year, monthIndex, 1);
  const currentEndExclusive = utcDate(year, monthIndex, day + 1);

  const comparisonStart = utcDate(year, monthIndex - 1, 1);
  // Day 0 of the current month = last day of the previous month.
  const lastDayOfComparisonMonth = utcDate(year, monthIndex, 0).getUTCDate();
  const comparisonDay = Math.min(day, lastDayOfComparisonMonth);
  const comparisonEndExclusive = utcDate(year, monthIndex - 1, comparisonDay + 1);

  const closedMonths: ClosedMonthPeriod[] = [];

  for (let offset = 1; offset <= INSIGHT_AVERAGE_MONTHS; offset++) {
    const start = utcDate(year, monthIndex - offset, 1);

    closedMonths.push({
      ...toInsightMonth(start),
      start,
      endExclusive: utcDate(year, monthIndex - offset + 1, 1),
    });
  }

  return {
    currentStart,
    currentEndExclusive,
    comparisonStart,
    comparisonEndExclusive,
    comparisonMonth: toInsightMonth(comparisonStart),
    closedMonths,
    queryStart: closedMonths[closedMonths.length - 1].start,
    queryEndExclusive: currentEndExclusive,
  };
}
