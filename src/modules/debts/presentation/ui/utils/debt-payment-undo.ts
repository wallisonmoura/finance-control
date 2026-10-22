import { DebtUi } from '../types/debts-ui.types';

// Mirrors Debt.canUndoPayment on the server, which has the final word.
const UNDO_PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canUndoDebtPayment(debt: DebtUi, now: number = Date.now()): boolean {
  if (debt.status !== 'PAID' || !debt.paymentRecordedAt) {
    return false;
  }

  return now - Date.parse(debt.paymentRecordedAt) <= UNDO_PAYMENT_WINDOW_MS;
}
