import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { makeCalculateMonthlySummaryUseCase } from '@/modules/finance/infra/factories/make-calculate-monthly-summary-use-case';
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
  MonthlySummaryUi,
} from '../ui/types/finance-ui.types';
import {
  buildOperationalSummaryDailyRows,
  getOperationalSummaryPeriod,
  type FinanceOperationalSummaryDailyRow,
  type FinanceOperationalSummaryFilters,
} from '../ui/utils/finance-operational-summary';

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

export async function getCurrentUserFinanceHistory(
  filters: FinanceHistoryFiltersUi,
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
