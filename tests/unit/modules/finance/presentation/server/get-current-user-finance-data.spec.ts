import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeCalculateMonthlySummaryUseCase } from '@/modules/finance/infra/factories/make-calculate-monthly-summary-use-case';
import { makeGetTransactionHistoryUseCase } from '@/modules/finance/infra/factories/make-get-transaction-history-use-case';
import { makeGetMonthlyInsightsUseCase } from '@/modules/finance/infra/factories/make-get-monthly-insights-use-case';
import { makeGetSpendingGoalsUseCase } from '@/modules/finance/infra/factories/make-get-spending-goals-use-case';
import { makeListExpenseCategoriesUseCase } from '@/modules/finance/infra/factories/make-list-expense-categories-use-case';
import {
  FULL_PERIOD_PAGE_SIZE,
  getCurrentUserExpenseCategories,
  getCurrentUserFinanceHistory,
  getCurrentUserMonthlyInsights,
  getCurrentUserOperationalSummary,
  getCurrentUserSpendingGoals,
} from '@/modules/finance/presentation/server/get-current-user-finance-data';

jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));
jest.mock(
  '@/modules/finance/infra/factories/make-calculate-monthly-summary-use-case',
  () => ({
    makeCalculateMonthlySummaryUseCase: jest.fn(),
  }),
);
jest.mock(
  '@/modules/finance/infra/factories/make-get-transaction-history-use-case',
  () => ({
    makeGetTransactionHistoryUseCase: jest.fn(),
  }),
);
jest.mock(
  '@/modules/finance/infra/factories/make-list-expense-categories-use-case',
  () => ({
    makeListExpenseCategoriesUseCase: jest.fn(),
  }),
);

const getAuthenticatedUserIdMock = jest.mocked(getAuthenticatedUserId);
const makeCalculateMonthlySummaryUseCaseMock = jest.mocked(
  makeCalculateMonthlySummaryUseCase,
);
const makeGetTransactionHistoryUseCaseMock = jest.mocked(
  makeGetTransactionHistoryUseCase,
);
const makeListExpenseCategoriesUseCaseMock = jest.mocked(
  makeListExpenseCategoriesUseCase,
);

jest.mock(
  '@/modules/finance/infra/factories/make-get-monthly-insights-use-case',
  () => ({
    makeGetMonthlyInsightsUseCase: jest.fn(),
  }),
);

const makeGetMonthlyInsightsUseCaseMock = jest.mocked(
  makeGetMonthlyInsightsUseCase,
);

describe('getCurrentUserFinanceHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(
      getCurrentUserFinanceHistory({
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        page: 1,
      }),
    ).resolves.toEqual({
      error: 'Não autenticado',
    });

    expect(makeGetTransactionHistoryUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return serialized history for the authenticated user', async () => {
    const execute = jest.fn().mockResolvedValueOnce({
      entries: [
        {
          id: 'entry-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 500,
          description: 'Corrida',
          date: new Date('2026-05-20T00:00:00.000Z'),
          categoryId: null,
          debtId: null,
          notes: null,
          createdAt: new Date('2026-05-20T00:00:00.000Z'),
          updatedAt: new Date('2026-05-20T00:00:00.000Z'),
        },
      ],
      totalIncome: 500,
      totalExpense: 0,
      balance: 500,
      pagination: {
        page: 1,
        pageSize: FULL_PERIOD_PAGE_SIZE,
        totalCount: 1,
        totalPages: 1,
      },
    });

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    await expect(
      getCurrentUserFinanceHistory({
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        type: 'INCOME',
        page: 1,
      }),
    ).resolves.toEqual({
      data: {
        entries: [
          {
            id: 'entry-id',
            userId: 'user-id',
            type: 'INCOME',
            amount: 500,
            description: 'Corrida',
            date: '2026-05-20T00:00:00.000Z',
            categoryId: null,
            debtId: null,
            notes: null,
            createdAt: '2026-05-20T00:00:00.000Z',
            updatedAt: '2026-05-20T00:00:00.000Z',
          },
        ],
        totalIncome: 500,
        totalExpense: 0,
        balance: 500,
        pagination: {
          page: 1,
          pageSize: FULL_PERIOD_PAGE_SIZE,
          totalCount: 1,
          totalPages: 1,
        },
      },
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      // O repositório filtra o período com `lt: endDate`, então o fim precisa
      // ser exclusivo para que lançamentos do próprio endDate entrem.
      endDate: new Date('2026-06-01T00:00:00.000Z'),
      type: 'INCOME',
      categoryId: undefined,
      // Este helper alimenta páginas que ainda listam o período inteiro sem
      // controle de paginação na UI (ver seguimento de frontend). pageSize
      // grande preserva esse comportamento em vez de truncar em 20 itens
      // quando nenhuma paginação explícita é passada.
      page: 1,
      pageSize: FULL_PERIOD_PAGE_SIZE,
    });
  });

  it('should forward an explicit pagination argument instead of the full-period default', async () => {
    const execute = jest.fn().mockResolvedValueOnce({
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: { page: 3, pageSize: 20, totalCount: 60, totalPages: 3 },
    });

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    const result = await getCurrentUserFinanceHistory(
      {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        page: 3,
      },
      { page: 3, pageSize: 20 },
    );

    expect(result.data?.pagination).toEqual({
      page: 3,
      pageSize: 20,
      totalCount: 60,
      totalPages: 3,
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        pageSize: 20,
      }),
    );
  });

  it('should forward the category filter to the use case', async () => {
    const execute = jest.fn().mockResolvedValueOnce({
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: {
        page: 1,
        pageSize: FULL_PERIOD_PAGE_SIZE,
        totalCount: 0,
        totalPages: 0,
      },
    });

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    await getCurrentUserFinanceHistory({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      type: 'EXPENSE',
      categoryId: '11111111-1111-4111-8111-111111111111',
      page: 1,
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: '11111111-1111-4111-8111-111111111111',
      }),
    );
  });

  it('should return generic error message when history loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    await expect(
      getCurrentUserFinanceHistory({
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        page: 1,
      }),
    ).resolves.toEqual({
      error: 'Não foi possível carregar histórico financeiro.',
    });
  });
});

describe('getCurrentUserOperationalSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(
      getCurrentUserOperationalSummary({
        year: 2026,
        month: 5,
      }),
    ).resolves.toEqual({
      error: 'Não autenticado',
    });

    expect(makeCalculateMonthlySummaryUseCaseMock).not.toHaveBeenCalled();
    expect(makeGetTransactionHistoryUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return monthly summary and daily rows for the authenticated user', async () => {
    const monthlyExecute = jest.fn().mockResolvedValueOnce({
      year: 2026,
      month: 5,
      totalIncome: 500,
      totalExpense: 120,
      result: 380,
    });
    const historyExecute = jest.fn().mockResolvedValueOnce({
      entries: [
        {
          id: 'income-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 500,
          description: 'Corrida',
          date: new Date('2026-05-02T00:00:00.000Z'),
          categoryId: null,
          debtId: null,
          notes: null,
          createdAt: new Date('2026-05-02T00:00:00.000Z'),
          updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        },
        {
          id: 'expense-id',
          userId: 'user-id',
          type: 'EXPENSE',
          amount: 120,
          description: 'Combustível',
          date: new Date('2026-05-02T00:00:00.000Z'),
          categoryId: 'category-id',
          debtId: null,
          notes: null,
          createdAt: new Date('2026-05-02T00:00:00.000Z'),
          updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        },
      ],
      totalIncome: 500,
      totalExpense: 120,
      balance: 380,
    });

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeCalculateMonthlySummaryUseCaseMock.mockReturnValueOnce({
      execute: monthlyExecute,
    } as unknown as ReturnType<typeof makeCalculateMonthlySummaryUseCase>);
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute: historyExecute,
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    const result = await getCurrentUserOperationalSummary({
      year: 2026,
      month: 5,
    });

    expect(result.monthlySummary).toEqual({
      year: 2026,
      month: 5,
      totalIncome: 500,
      totalExpense: 120,
      result: 380,
    });
    expect(result.dailyRows).toHaveLength(31);
    expect(result.dailyRows?.[1]).toEqual({
      date: '2026-05-02',
      day: 2,
      totalIncome: 500,
      totalExpense: 120,
      result: 380,
    });
    expect(monthlyExecute).toHaveBeenCalledWith({
      userId: 'user-id',
      year: 2026,
      month: 5,
    });
    expect(historyExecute).toHaveBeenCalledWith({
      userId: 'user-id',
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      // Fim exclusivo: sem isso o último dia do mês fica de fora e a linha
      // correspondente do resumo diário aparece zerada.
      endDate: new Date('2026-06-01T00:00:00.000Z'),
      // O resumo diário precisa de todos os lançamentos do mês para agrupar
      // por dia corretamente — nunca só a primeira página.
      page: 1,
      pageSize: FULL_PERIOD_PAGE_SIZE,
    });
  });

  it('should return generic error message when operational summary loading fails', async () => {
    const monthlyExecute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeCalculateMonthlySummaryUseCaseMock.mockReturnValueOnce({
      execute: monthlyExecute,
    } as unknown as ReturnType<typeof makeCalculateMonthlySummaryUseCase>);
    makeGetTransactionHistoryUseCaseMock.mockReturnValueOnce({
      execute: jest.fn(),
    } as unknown as ReturnType<typeof makeGetTransactionHistoryUseCase>);

    await expect(
      getCurrentUserOperationalSummary({
        year: 2026,
        month: 5,
      }),
    ).resolves.toEqual({
      error: 'Não foi possível carregar o resumo financeiro.',
    });
  });
});

describe('getCurrentUserExpenseCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expense categories for the authenticated user', async () => {
    const categories = [
      {
        id: 'category-id',
        name: 'Combustível',
        slug: 'combustivel',
      },
    ];
    const execute = jest.fn().mockResolvedValueOnce(categories);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListExpenseCategoriesUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListExpenseCategoriesUseCase>);

    await expect(getCurrentUserExpenseCategories()).resolves.toEqual({
      data: categories,
    });

    expect(execute).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('should return generic error message when categories loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListExpenseCategoriesUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListExpenseCategoriesUseCase>);

    await expect(getCurrentUserExpenseCategories()).resolves.toEqual({
      error: 'Não foi possível carregar categorias.',
    });
  });
});

describe('getCurrentUserMonthlyInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    await expect(getCurrentUserMonthlyInsights()).resolves.toEqual({
      error: 'Não autenticado',
    });
    expect(makeGetMonthlyInsightsUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return the insights of the authenticated user', async () => {
    const insights = {
      comparisonMonth: { year: 2026, month: 8 },
      hasEntries: true,
      expenseInsights: [
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: null, amount: 90, sharePercent: 100 },
      ],
      incomeInsights: [
        { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 90, result: 10 },
      ],
    };
    const execute = jest.fn().mockResolvedValue(insights);
    getAuthenticatedUserIdMock.mockResolvedValue('user-1');
    makeGetMonthlyInsightsUseCaseMock.mockReturnValue({ execute } as never);

    await expect(getCurrentUserMonthlyInsights()).resolves.toEqual({ data: insights });
    expect(execute).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('should return an error message when the use case fails', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue('user-1');
    makeGetMonthlyInsightsUseCaseMock.mockReturnValue({
      execute: jest.fn().mockRejectedValue(new Error('db down')),
    } as never);

    await expect(getCurrentUserMonthlyInsights()).resolves.toEqual({
      error: 'Não foi possível carregar os insights.',
    });
  });
});

jest.mock(
  '@/modules/finance/infra/factories/make-get-spending-goals-use-case',
  () => ({
    makeGetSpendingGoalsUseCase: jest.fn(),
  }),
);

const makeGetSpendingGoalsUseCaseMock = jest.mocked(makeGetSpendingGoalsUseCase);

describe('getCurrentUserSpendingGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    await expect(getCurrentUserSpendingGoals()).resolves.toEqual({
      error: 'Não autenticado',
    });
    expect(makeGetSpendingGoalsUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return the spending goals of the authenticated user', async () => {
    const overview = {
      goals: [
        {
          categoryId: 'bebida',
          categoryName: 'Bebida',
          limit: 300,
          spent: 100,
          usedPercent: 33,
          expectedSoFar: 150,
          monthElapsedPercent: 50,
          remaining: 200,
          overBy: 0,
          status: 'ON_TRACK',
        },
      ],
      availableCategories: [{ id: 'lazer', name: 'Lazer', averageSpent: null }],
      averageByCategoryId: { bebida: 250, lazer: null },
    };
    const execute = jest.fn().mockResolvedValue(overview);
    getAuthenticatedUserIdMock.mockResolvedValue('user-1');
    makeGetSpendingGoalsUseCaseMock.mockReturnValue({ execute } as never);

    await expect(getCurrentUserSpendingGoals()).resolves.toEqual({ data: overview });
    expect(execute).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('should return an error message when the use case fails', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue('user-1');
    makeGetSpendingGoalsUseCaseMock.mockReturnValue({
      execute: jest.fn().mockRejectedValue(new Error('db down')),
    } as never);

    await expect(getCurrentUserSpendingGoals()).resolves.toEqual({
      error: 'Não foi possível carregar as metas.',
    });
  });
});
