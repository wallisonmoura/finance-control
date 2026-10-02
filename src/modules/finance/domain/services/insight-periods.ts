export const INSIGHT_AVERAGE_MONTHS = 3;

export interface InsightMonth {
  year: number;
  month: number;
}

export interface ClosedMonthPeriod extends InsightMonth {
  start: Date;
  endExclusive: Date;
}

export type InsightMode = 'current' | 'closed';

export interface InsightPeriods {
  currentStart: Date;
  currentEndExclusive: Date;
  comparisonStart: Date;
  comparisonEndExclusive: Date;
  comparisonMonth: InsightMonth;
  referenceMonth: InsightMonth;
  isClosedMonth: boolean;
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

function buildClosedMonths(
  year: number,
  referenceMonthIndex: number,
): ClosedMonthPeriod[] {
  const closedMonths: ClosedMonthPeriod[] = [];

  for (let offset = 1; offset <= INSIGHT_AVERAGE_MONTHS; offset++) {
    const start = utcDate(year, referenceMonthIndex - offset, 1);

    closedMonths.push({
      ...toInsightMonth(start),
      start,
      endExclusive: utcDate(year, referenceMonthIndex - offset + 1, 1),
    });
  }

  return closedMonths;
}

// Reference = the last closed month (whole), compared with the whole month
// before it. Used when the current month has no entries yet.
function getClosedMonthPeriods(year: number, monthIndex: number): InsightPeriods {
  const referenceMonthIndex = monthIndex - 1;
  const currentStart = utcDate(year, referenceMonthIndex, 1);
  const currentEndExclusive = utcDate(year, monthIndex, 1);
  const comparisonStart = utcDate(year, referenceMonthIndex - 1, 1);
  const closedMonths = buildClosedMonths(year, referenceMonthIndex);

  return {
    currentStart,
    currentEndExclusive,
    comparisonStart,
    comparisonEndExclusive: currentStart,
    comparisonMonth: toInsightMonth(comparisonStart),
    referenceMonth: toInsightMonth(currentStart),
    isClosedMonth: true,
    closedMonths,
    queryStart: closedMonths[closedMonths.length - 1].start,
    queryEndExclusive: currentEndExclusive,
  };
}

/**
 * All date ranges used by the monthly insights, derived from the business
 * "today" (YYYY-MM-DD). Ends are exclusive, matching
 * FinancialEntryRepository.findByUserIdAndPeriod's `lt: endDate`.
 *
 * `current` mode: the current month up to today, compared with the previous
 * month up to the same day, so a partial month is never compared against a
 * full one. `closed` mode: the last closed month, compared with the whole
 * month before it.
 */
export function getInsightPeriods(
  todayValue: string,
  mode: InsightMode = 'current',
): InsightPeriods {
  const [year, month, day] = todayValue.split('-').map(Number);
  const monthIndex = month - 1;

  if (mode === 'closed') {
    return getClosedMonthPeriods(year, monthIndex);
  }

  const currentStart = utcDate(year, monthIndex, 1);
  const currentEndExclusive = utcDate(year, monthIndex, day + 1);

  const comparisonStart = utcDate(year, monthIndex - 1, 1);
  // Day 0 of the current month = last day of the previous month.
  const lastDayOfComparisonMonth = utcDate(year, monthIndex, 0).getUTCDate();
  const comparisonDay = Math.min(day, lastDayOfComparisonMonth);
  const comparisonEndExclusive = utcDate(year, monthIndex - 1, comparisonDay + 1);

  const closedMonths = buildClosedMonths(year, monthIndex);

  return {
    currentStart,
    currentEndExclusive,
    comparisonStart,
    comparisonEndExclusive,
    comparisonMonth: toInsightMonth(comparisonStart),
    referenceMonth: toInsightMonth(currentStart),
    isClosedMonth: false,
    closedMonths,
    queryStart: closedMonths[closedMonths.length - 1].start,
    queryEndExclusive: currentEndExclusive,
  };
}
