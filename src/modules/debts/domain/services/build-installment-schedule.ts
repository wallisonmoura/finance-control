import { InvalidInstallmentCountError } from '../errors/invalid-installment-count.error';
import { addMonthsClampingToMonthEnd } from './add-months-clamping-to-month-end';

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
