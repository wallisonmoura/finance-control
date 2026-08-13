import { DebtUi } from '../types/debts-ui.types';

export function sumDebtAmounts(debts: DebtUi[]): number {
  return debts.reduce((total, debt) => total + debt.amount, 0);
}
