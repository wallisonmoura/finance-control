import { act, renderHook, waitFor } from '@testing-library/react';

import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { useCategoryHistory } from '@/modules/reports/presentation/ui/hooks/use-category-history';
import { ReportsPeriodMonths } from '@/modules/reports/presentation/ui/utils/reports-period';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-10-08',
}));

const getFullFinanceHistoryMock = jest.mocked(financeApiService.getFullFinanceHistory);
const getExpenseCategoriesMock = jest.mocked(financeApiService.getExpenseCategories);

function entry(amount: number, date: string): FinanceEntryUi {
  return {
    id: `${date}-${amount}`,
    userId: 'u1',
    type: 'EXPENSE',
    amount,
    description: 'Despesa',
    date,
    categoryId: 'cat-1',
    notes: null,
    createdAt: '',
    updatedAt: '',
  };
}

function history(entries: FinanceEntryUi[]) {
  return {
    data: {
      entries,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: { page: 1, pageSize: 0, totalCount: entries.length, totalPages: 1 },
    },
  };
}

const categories = {
  data: [
    { id: 'cat-1', name: 'Combustível', slug: 'combustivel', monthlyLimit: 1500 },
    { id: 'cat-2', name: 'Lazer', slug: 'lazer', monthlyLimit: null },
  ],
};

describe('useCategoryHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getExpenseCategoriesMock.mockResolvedValue(categories);
  });

  it('should load the category expenses of the period and build its history', async () => {
    getFullFinanceHistoryMock.mockResolvedValue(history([entry(2000, '2026-07-10')]));

    const { result } = renderHook(() => useCategoryHistory('cat-1', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getFullFinanceHistoryMock).toHaveBeenCalledWith({
      startDate: '2026-05-01',
      endDate: '2026-10-31',
      type: 'EXPENSE',
      categoryId: 'cat-1',
    });
    expect(result.current.category).toEqual({
      id: 'cat-1',
      name: 'Combustível',
      monthlyLimit: 1500,
    });
    expect(result.current.range).toEqual({ startDate: '2026-05-01', endDate: '2026-10-31' });
    expect(result.current.history?.months).toHaveLength(6);
    expect(result.current.history?.exceeded).toEqual({ count: 1, closedMonths: 5 });
  });

  it('should report a category missing from the user list as not found', async () => {
    getFullFinanceHistoryMock.mockResolvedValue(history([]));

    const { result } = renderHook(() => useCategoryHistory('other-user-cat', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notFound).toBe(true);
    expect(result.current.history).toBeNull();
  });

  it('should report an invalid id as not found even when the history request is refused', async () => {
    // The history API rejects a non-UUID categoryId with a validation error.
    getFullFinanceHistoryMock.mockResolvedValue({ error: 'Erro de validação.' });

    const { result } = renderHook(() => useCategoryHistory('abc', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should expose a categories failure as an error', async () => {
    getFullFinanceHistoryMock.mockResolvedValue(history([]));
    getExpenseCategoriesMock.mockResolvedValue({ error: 'Falha nas categorias' });

    const { result } = renderHook(() => useCategoryHistory('cat-1', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha nas categorias');
    expect(result.current.notFound).toBe(false);
  });

  it('should expose the error of a failed request', async () => {
    getFullFinanceHistoryMock.mockResolvedValue({ error: 'Falha ao buscar' });

    const { result } = renderHook(() => useCategoryHistory('cat-1', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha ao buscar');
    expect(result.current.history).toBeNull();
  });

  it('should ignore a stale response when the period changes quickly', async () => {
    let resolveFirst: (value: ReturnType<typeof history>) => void = () => {};
    getFullFinanceHistoryMock
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce(history([entry(100, '2025-11-10')]));

    const { result, rerender } = renderHook(
      ({ months }: { months: ReportsPeriodMonths }) => useCategoryHistory('cat-1', months),
      { initialProps: { months: 3 as ReportsPeriodMonths } },
    );

    rerender({ months: 12 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      resolveFirst(history([entry(999, '2026-09-10')]));
    });

    expect(result.current.history?.months).toHaveLength(12);
    expect(result.current.history?.periodTotal).toBe(100);
  });

  it('should recalculate with a new limit without fetching again', async () => {
    getFullFinanceHistoryMock.mockResolvedValue(history([entry(1200, '2026-07-10')]));

    const { result } = renderHook(() => useCategoryHistory('cat-2', 6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.history?.exceeded).toBeNull();

    act(() => result.current.setLimit(1000));

    expect(result.current.category?.monthlyLimit).toBe(1000);
    expect(result.current.history?.exceeded).toEqual({ count: 1, closedMonths: 5 });
    expect(getFullFinanceHistoryMock).toHaveBeenCalledTimes(1);
  });
});
