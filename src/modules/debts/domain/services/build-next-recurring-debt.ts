import { randomUUID } from 'node:crypto';
import { Debt } from '../entities/debt.entity';
import { DebtStatus } from '../enums/debt-status.enum';
import { DebtType } from '../enums/debt-type.enum';
import { addMonthsClampingToMonthEnd } from './add-months-clamping-to-month-end';

// Builds the next pending occurrence of a RECURRING debt right after the
// current one is paid. The due date is always one month after the ORIGINAL
// due date (not the payment date), so the recurrence keeps a fixed schedule
// regardless of when the user actually pays each occurrence.
export function buildNextRecurringDebt(paidDebt: Debt, now: Date): Debt {
  return Debt.create({
    id: randomUUID(),
    userId: paidDebt.userId,
    description: paidDebt.description,
    amount: paidDebt.amount,
    dueDate: addMonthsClampingToMonthEnd(paidDebt.dueDate, 1),
    type: DebtType.RECURRING,
    status: DebtStatus.PENDING,
    notes: paidDebt.notes,
    paidAt: null,
    paymentSource: null,
    createdAt: now,
    updatedAt: now,
  });
}
