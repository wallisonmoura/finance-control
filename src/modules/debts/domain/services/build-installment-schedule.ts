import { InvalidInstallmentCountError } from '../errors/invalid-installment-count.error';

export interface InstallmentScheduleEntry {
  amount: number;
  dueDate: Date;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

// Adds `monthsToAdd` months to `date`, keeping the original day-of-month but
// clamping it to the last day of the target month when that day doesn't
// exist there (e.g. Jan 31 + 1 month -> Feb 28/29, not a rollover to Mar 3).
// Always computed from the original date, not compounded from a previously
// clamped result, so each installment lands on the same "day of month"
// intent independently.
function addMonthsClampingToMonthEnd(date: Date, monthsToAdd: number): Date {
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

export function buildInstallmentSchedule(
  totalAmount: number,
  installmentCount: number,
  firstDueDate: Date,
): InstallmentScheduleEntry[] {
  if (
    !Number.isInteger(installmentCount) ||
    installmentCount < 2 ||
    installmentCount > 12
  ) {
    throw new InvalidInstallmentCountError();
  }

  const totalCents = toCents(totalAmount);
  const baseInstallmentCents = Math.floor(totalCents / installmentCount);
  const lastInstallmentCents =
    totalCents - baseInstallmentCents * (installmentCount - 1);

  return Array.from({ length: installmentCount }, (_, index) => {
    const isLast = index === installmentCount - 1;
    const cents = isLast ? lastInstallmentCents : baseInstallmentCents;

    return {
      amount: fromCents(cents),
      dueDate: addMonthsClampingToMonthEnd(firstDueDate, index),
    };
  });
}
