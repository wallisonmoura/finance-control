export type FinanceEntryTypeUi = 'INCOME' | 'EXPENSE';

export type FinanceEntryUi = {
  id: string;
  userId: string;
  type: FinanceEntryTypeUi;
  amount: number;
  description: string;
  date: string;
  categoryId: string | null;
  debtId?: string | null;
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
  categoryId?: string;
  page: number;
};

export type FinanceHistoryPaginationUi = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type FinanceHistoryUi = {
  entries: FinanceEntryUi[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pagination: FinanceHistoryPaginationUi;
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

// null = category could not be resolved; the UI decides how to display it.
type InsightCategoryNameUi = string | null;

export type MonthlyInsightUi =
  | { kind: 'EXPENSE_TOTAL_COMPARISON'; current: number; previous: number; changePercent: number }
  | { kind: 'TOP_EXPENSE_CATEGORY'; categoryName: InsightCategoryNameUi; amount: number; sharePercent: number }
  | {
      kind: 'EXPENSE_CATEGORY_RISE';
      categoryName: InsightCategoryNameUi;
      current: number;
      previous: number;
      changePercent: number | null;
      potentialSaving: number | null;
    }
  | {
      kind: 'EXPENSE_CATEGORY_DROP';
      categoryName: InsightCategoryNameUi;
      current: number;
      previous: number;
      changePercent: number;
    }
  | { kind: 'INCOME_TOTAL_COMPARISON'; current: number; previous: number; changePercent: number }
  | { kind: 'INCOME_VS_AVERAGE'; current: number; average: number; monthsCount: number }
  | { kind: 'MONTH_RESULT'; totalIncome: number; totalExpense: number; result: number };

export type MonthlyInsightKindUi = MonthlyInsightUi['kind'];

export type InsightMonthUi = { year: number; month: number };

export type MonthlyInsightsUi = {
  comparisonMonth: InsightMonthUi;
  referenceMonth: InsightMonthUi;
  isClosedMonth: boolean;
  hasEntries: boolean;
  expenseInsights: MonthlyInsightUi[];
  incomeInsights: MonthlyInsightUi[];
};
