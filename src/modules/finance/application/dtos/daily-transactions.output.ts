import { FinancialEntryOutput } from './financial-entry.output';

export interface DailyTransactionsOutput {
  date: Date;
  entries: FinancialEntryOutput[];
  totalIncome: number;
  totalExpense: number;
  dailyProfit: number;
}
