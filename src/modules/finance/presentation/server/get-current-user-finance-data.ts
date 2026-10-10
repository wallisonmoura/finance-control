import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { FULL_PERIOD_PAGE_SIZE } from '@/modules/finance/constants/finance.constants';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { makeCalculateMonthlySummaryUseCase } from '@/modules/finance/infra/factories/make-calculate-monthly-summary-use-case';
import { makeGetMonthlyInsightsUseCase } from '@/modules/finance/infra/factories/make-get-monthly-insights-use-case';
import { makeGetIncomeGoalsUseCase } from '@/modules/finance/infra/factories/make-get-income-goals-use-case';
import { makeGetSpendingGoalsUseCase } from '@/modules/finance/infra/factories/make-get-spending-goals-use-case';
import { makeGetTransactionHistoryUseCase } from '@/modules/finance/infra/factories/make-get-transaction-history-use-case';
import { makeListExpenseCategoriesUseCase } from '@/modules/finance/infra/factories/make-list-expense-categories-use-case';
import {
  parseDateFromQuery,
  parseExclusiveEndDateFromQuery,
} from '@/modules/finance/presentation/http/schemas/shared/parse-date-from-query';

import {
  ExpenseCategoryUi,
  FinanceEntryTypeUi,
  FinanceEntryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
  IncomeGoalsOverviewUi,
  MonthlyInsightsUi,
  MonthlySummaryUi,
  SpendingGoalsOverviewUi,
} from '../ui/types/finance-ui.types';
import {
  buildOperationalSummaryDailyRows,
  getOperationalSummaryPeriod,
  type FinanceOperationalSummaryDailyRow,
  type FinanceOperationalSummaryFilters,
} from '../ui/utils/finance-operational-summary';

// GetTransactionHistoryUseCase agora pagina por padrão (contrato da API
// GET /api/finance/history). getCurrentUserFinanceHistory usa esse pageSize
// generoso como default para preservar "período inteiro sem paginação" nas
// telas que ainda não têm controle de página na UI (dashboard, despesas,
// receitas) — /finance/history é a exceção e passa sua própria paginação.
// Reexportado por compatibilidade — a fonte da constante é
// `finance.constants.ts`, também usada por GetFullTransactionHistoryController.
export { FULL_PERIOD_PAGE_SIZE };

type CurrentUserFinanceHistoryResult = {
  data?: FinanceHistoryUi;
  error?: string;
};

type CurrentUserExpenseCategoriesResult = {
  data?: ExpenseCategoryUi[];
  error?: string;
};

type CurrentUserOperationalSummaryResult = {
  monthlySummary?: MonthlySummaryUi | null;
  dailyRows?: FinanceOperationalSummaryDailyRow[];
  error?: string;
};

function toFinanceEntryUi(entry: FinancialEntryOutput): FinanceEntryUi {
  return {
    ...entry,
    date: entry.date.toISOString(),
    categoryId: entry.categoryId ?? null,
    debtId: entry.debtId ?? null,
    notes: entry.notes ?? null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function toFinanceHistoryUi(history: TransactionHistoryOutput): FinanceHistoryUi {
  return {
    ...history,
    entries: history.entries.map(toFinanceEntryUi),
  };
}

function toFinancialEntryType(type?: FinanceEntryTypeUi): FinancialEntryType | undefined {
  if (!type) {
    return undefined;
  }

  return type === 'INCOME' ? FinancialEntryType.INCOME : FinancialEntryType.EXPENSE;
}

async function getCurrentUserIdOrError(): Promise<
  { userId: string; error?: never } | { userId?: never; error: string }
> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      error: 'Não autenticado',
    };
  }

  return { userId };
}

type FinanceHistoryPagination = {
  page: number;
  pageSize: number;
};

const FULL_PERIOD_PAGINATION: FinanceHistoryPagination = {
  page: 1,
  pageSize: FULL_PERIOD_PAGE_SIZE,
};

export async function getCurrentUserFinanceHistory(
  filters: FinanceHistoryFiltersUi,
  pagination: FinanceHistoryPagination = FULL_PERIOD_PAGINATION,
): Promise<CurrentUserFinanceHistoryResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeGetTransactionHistoryUseCase();
    const history = await useCase.execute({
      userId: auth.userId,
      startDate: parseDateFromQuery(filters.startDate),
      endDate: parseExclusiveEndDateFromQuery(filters.endDate),
      type: toFinancialEntryType(filters.type),
      categoryId: filters.categoryId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return {
      data: toFinanceHistoryUi(history),
    };
  } catch {
    return {
      error: 'Não foi possível carregar histórico financeiro.',
    };
  }
}

export async function getCurrentUserExpenseCategories(): Promise<CurrentUserExpenseCategoriesResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeListExpenseCategoriesUseCase();
    const categories = await useCase.execute({ userId: auth.userId });

    return {
      data: categories,
    };
  } catch {
    return {
      error: 'Não foi possível carregar categorias.',
    };
  }
}

export async function getCurrentUserOperationalSummary(
  filters: FinanceOperationalSummaryFilters,
): Promise<CurrentUserOperationalSummaryResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const period = getOperationalSummaryPeriod(filters);
    const monthlySummaryUseCase = makeCalculateMonthlySummaryUseCase();
    const historyUseCase = makeGetTransactionHistoryUseCase();

    const [monthlySummary, history] = await Promise.all([
      monthlySummaryUseCase.execute({
        userId: auth.userId,
        year: filters.year,
        month: filters.month,
      }),
      historyUseCase.execute({
        userId: auth.userId,
        startDate: parseDateFromQuery(period.startDate),
        endDate: parseExclusiveEndDateFromQuery(period.endDate),
        page: 1,
        pageSize: FULL_PERIOD_PAGE_SIZE,
      }),
    ]);

    const historyUi = toFinanceHistoryUi(history);

    return {
      monthlySummary,
      dailyRows: buildOperationalSummaryDailyRows(filters, historyUi.entries),
    };
  } catch {
    return {
      error: 'Não foi possível carregar o resumo financeiro.',
    };
  }
}

type CurrentUserMonthlyInsightsResult = {
  data?: MonthlyInsightsUi;
  error?: string;
};

export async function getCurrentUserMonthlyInsights(): Promise<CurrentUserMonthlyInsightsResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeGetMonthlyInsightsUseCase();
    // The output holds only numbers, strings and nulls, so it is already
    // serializable and structurally identical to MonthlyInsightsUi.
    const insights = await useCase.execute({ userId: auth.userId });

    return {
      data: insights,
    };
  } catch {
    return {
      error: 'Não foi possível carregar os insights.',
    };
  }
}

type CurrentUserSpendingGoalsResult = {
  data?: SpendingGoalsOverviewUi;
  error?: string;
};

export async function getCurrentUserSpendingGoals(): Promise<CurrentUserSpendingGoalsResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeGetSpendingGoalsUseCase();
    // The output holds only numbers, strings and nulls, so it is already
    // serializable and structurally identical to SpendingGoalsOverviewUi.
    const overview = await useCase.execute({ userId: auth.userId });

    return {
      data: overview,
    };
  } catch {
    return {
      error: 'Não foi possível carregar as metas.',
    };
  }
}

type CurrentUserIncomeGoalsResult = {
  data?: IncomeGoalsOverviewUi;
  error?: string;
};

export async function getCurrentUserIncomeGoals(): Promise<CurrentUserIncomeGoalsResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeGetIncomeGoalsUseCase();
    // The output holds only numbers, strings and nulls, so it is already
    // serializable and structurally identical to IncomeGoalsOverviewUi.
    const overview = await useCase.execute({ userId: auth.userId });

    return {
      data: overview,
    };
  } catch {
    return {
      error: 'Não foi possível carregar as metas de ganho.',
    };
  }
}
