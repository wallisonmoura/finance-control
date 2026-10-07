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
  monthlyLimit?: number | null;
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
  | {
      kind: 'INCOME_VS_AVERAGE';
      current: number;
      average: number;
      monthsCount: number;
      expectedSoFar: number;
      paceChangePercent: number;
    }
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

export type SpendingGoalStatusUi = 'EXCEEDED' | 'ABOVE_PACE' | 'ON_TRACK';

export type SpendingGoalUi = {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  usedPercent: number;
  expectedSoFar: number;
  projected: number | null;
  remaining: number;
  overBy: number;
  status: SpendingGoalStatusUi;
};

export type SpendingGoalCategoryOptionUi = {
  id: string;
  name: string;
  averageSpent: number | null;
};

export type SpendingGoalsOverviewUi = {
  goals: SpendingGoalUi[];
  availableCategories: SpendingGoalCategoryOptionUi[];
  averageByCategoryId: Record<string, number | null>;
};
