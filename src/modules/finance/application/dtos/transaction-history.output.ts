import { FinancialEntryOutput } from './financial-entry.output';

export interface TransactionHistoryPaginationOutput {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TransactionHistoryOutput {
  entries: FinancialEntryOutput[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pagination: TransactionHistoryPaginationOutput;
}
