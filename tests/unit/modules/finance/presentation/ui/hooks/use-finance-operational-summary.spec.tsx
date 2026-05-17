import { renderHook, waitFor } from '@testing-library/react';

import { useFinanceOperationalSummary } from '@/modules/finance/presentation/ui/hooks/use-finance-operational-summary';
import {
  getFinanceHistory,
  getMonthlySummary,
} from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');

const getFinanceHistoryMock = jest.mocked(getFinanceHistory);
const getMonthlySummaryMock = jest.mocked(getMonthlySummary);

describe('useFinanceOperationalSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load monthly summary with daily rows', async () => {
    getMonthlySummaryMock.mockResolvedValueOnce({
      data: {
        year: 2026,
        month: 5,
        totalIncome: 1000,
        totalExpense: 400,
        result: 600,
      },
    });
    getFinanceHistoryMock.mockResolvedValueOnce({
      data: {
        entries: [
          {
            id: 'income-id',
            userId: 'user-id',
            type: 'INCOME',
            amount: 300,
            description: 'Corrida',
            date: '2026-05-02T00:00:00.000Z',
            categoryId: null,
            notes: null,
            createdAt: '2026-05-02T00:00:00.000Z',
            updatedAt: '2026-05-02T00:00:00.000Z',
          },
          {
            id: 'expense-id',
            userId: 'user-id',
            type: 'EXPENSE',
            amount: 120,
            description: 'Combustivel',
            date: '2026-05-02T00:00:00.000Z',
            categoryId: 'category-id',
            notes: null,
            createdAt: '2026-05-02T00:00:00.000Z',
            updatedAt: '2026-05-02T00:00:00.000Z',
          },
        ],
        totalIncome: 300,
        totalExpense: 120,
        balance: 180,
      },
    });

    const { result } = renderHook(() =>
      useFinanceOperationalSummary({
        year: 2026,
        month: 5,
      }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getMonthlySummaryMock).toHaveBeenCalledWith({
      year: 2026,
      month: 5,
    });
    expect(getFinanceHistoryMock).toHaveBeenCalledWith({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
    expect(result.current.monthlySummary?.result).toBe(600);
    expect(result.current.dailyRows).toHaveLength(31);
    expect(result.current.dailyRows[1]).toMatchObject({
      day: 2,
      totalIncome: 300,
      totalExpense: 120,
      result: 180,
    });
  });

  it('should expose error when summary loading fails', async () => {
    getMonthlySummaryMock.mockResolvedValueOnce({
      error: 'Nao foi possivel carregar resumo mensal.',
    });
    getFinanceHistoryMock.mockResolvedValueOnce({
      data: {
        entries: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      },
    });

    const { result } = renderHook(() =>
      useFinanceOperationalSummary({
        year: 2026,
        month: 5,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Nao foi possivel carregar resumo mensal.',
    );
    expect(result.current.monthlySummary).toBeNull();
    expect(result.current.dailyRows).toEqual([]);
  });
});
