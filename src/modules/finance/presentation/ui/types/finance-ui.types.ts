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

export type RegisterExpenseUiInput = {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
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

export type ExpenseCategoryUi = {
  id: string;
  name: string;
  slug: string;
};

export type DailyProfitUi = {
  date: string;
  totalIncome: number;
  totalExpense: number;
  profit: number;
};

export type MonthlySummaryUi = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  result: number;
};

export type UpdateIncomeUiInput = {
  amount: number;
  description: string;
  date: string;
  notes?: string | null;
};

export type UpdateExpenseUiInput = {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  notes?: string | null;
};

export type FinanceApiResponse<T> = {
  data?: T;
  error?: string;
};
