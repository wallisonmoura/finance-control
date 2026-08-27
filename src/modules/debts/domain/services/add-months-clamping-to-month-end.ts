// Adds `monthsToAdd` months to `date`, keeping the original day-of-month but
// clamping it to the last day of the target month when that day doesn't
// exist there (e.g. Jan 31 + 1 month -> Feb 28/29, not a rollover to Mar 3).
// Always computed from the original date, not compounded from a previously
// clamped result, so each occurrence lands on the same "day of month"
// intent independently.
export function addMonthsClampingToMonthEnd(
  date: Date,
  monthsToAdd: number,
): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonthIndex = month + monthsToAdd;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, targetMonthIndex + 1, 0),
  ).getUTCDate();

  const clampedDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(Date.UTC(year, targetMonthIndex, clampedDay));
}
