import { FinancialEntryOutput } from './financial-entry.output';

export interface TransactionHistoryOutput {
  entries: FinancialEntryOutput[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
