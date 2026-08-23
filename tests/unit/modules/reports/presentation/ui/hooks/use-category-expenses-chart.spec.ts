import { renderHook, waitFor } from '@testing-library/react';

import { useCategoryExpensesChart } from '@/modules/reports/presentation/ui/hooks/use-category-expenses-chart';
import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-08-22',
}));

const getFullFinanceHistoryMock = jest.mocked(
  financeApiService.getFullFinanceHistory,
);
const getExpenseCategoriesMock = jest.mocked(
  financeApiService.getExpenseCategories,
);

describe('useCategoryExpensesChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate expense totals by category name, sorted descending', async () => {
    getFullFinanceHistoryMock.mockResolvedValue({
      data: {
        entries: [
          {
            id: '1',
            userId: 'u1',
            type: 'EXPENSE',
            amount: 50,
            description: 'a',
            date: '2026-08-01',
            categoryId: 'cat-food',
            notes: null,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: '2',
            userId: 'u1',
            type: 'EXPENSE',
            amount: 150,
            description: 'b',
            date: '2026-08-05',
            categoryId: 'cat-fuel',
            notes: null,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: '3',
            userId: 'u1',
            type: 'EXPENSE',
            amount: 25,
            description: 'c',
            date: '2026-08-10',
            categoryId: 'cat-food',
            notes: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
        totalIncome: 0,
        totalExpense: 225,
        balance: -225,
        pagination: { page: 1, pageSize: 0, totalCount: 3, totalPages: 1 },
      },
    });
    getExpenseCategoriesMock.mockResolvedValue({
      data: [
        { id: 'cat-food', name: 'Alimentação', slug: 'alimentacao' },
        { id: 'cat-fuel', name: 'Combustível', slug: 'combustivel' },
      ],
    });

    const { result } = renderHook(() => useCategoryExpensesChart(6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([
      { categoryId: 'cat-fuel', categoryName: 'Combustível', total: 150 },
      { categoryId: 'cat-food', categoryName: 'Alimentação', total: 75 },
    ]);
    expect(getFullFinanceHistoryMock).toHaveBeenCalledWith({
      startDate: '2026-03-01',
      endDate: '2026-08-31',
      type: 'EXPENSE',
    });
  });

  it('should set error when the history request fails', async () => {
    getFullFinanceHistoryMock.mockResolvedValue({ error: 'Falha ao buscar' });
    getExpenseCategoriesMock.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useCategoryExpensesChart(6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha ao buscar');
    expect(result.current.data).toEqual([]);
  });
});
