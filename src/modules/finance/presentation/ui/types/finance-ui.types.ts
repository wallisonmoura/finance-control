export type FinanceEntryTypeUi = 'INCOME' | 'EXPENSE';

export type FinanceEntryUi = {
  id: string;
  userId: string;
  type: FinanceEntryTypeUi;
  amount: number;
  description: string;
  date: string;
  categoryId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIncomeUiInput = {
  amount: number;
  description: string;
  date: string;
  notes?: string | null;
};

export type FinanceHistoryFiltersUi = {
  startDate: string;
  endDate: string;
  type?: FinanceEntryTypeUi;
};

export type FinanceHistoryUi = {
  entries: FinanceEntryUi[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type UpdateIncomeUiInput = {
  amount: number;
  description: string;
  date: string;
  notes?: string | null;
};

export type FinanceApiResponse<T> = {
  data?: T;
  error?: string;
};
