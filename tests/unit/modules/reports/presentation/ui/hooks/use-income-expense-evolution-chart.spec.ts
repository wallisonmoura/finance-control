import { renderHook, waitFor } from '@testing-library/react';

import { useIncomeExpenseEvolutionChart } from '@/modules/reports/presentation/ui/hooks/use-income-expense-evolution-chart';
import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');

const getMonthlySummaryRangeMock = jest.mocked(
  financeApiService.getMonthlySummaryRange,
);

describe('useIncomeExpenseEvolutionChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and map the range into chart data with formatted month labels', async () => {
    getMonthlySummaryRangeMock.mockResolvedValue({
      data: [
        { month: 7, year: 2026, totalIncome: 100, totalExpense: 40, result: 60 },
        { month: 8, year: 2026, totalIncome: 120, totalExpense: 50, result: 70 },
      ],
    });

    const { result } = renderHook(() => useIncomeExpenseEvolutionChart(6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([
      { monthLabel: 'jul/26', totalIncome: 100, totalExpense: 40 },
      { monthLabel: 'ago/26', totalIncome: 120, totalExpense: 50 },
    ]);
    expect(getMonthlySummaryRangeMock).toHaveBeenCalledWith(6);
  });

  it('should set error when the request fails', async () => {
    getMonthlySummaryRangeMock.mockResolvedValue({ error: 'Falha ao buscar' });

    const { result } = renderHook(() => useIncomeExpenseEvolutionChart(6));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha ao buscar');
    expect(result.current.data).toEqual([]);
  });
});
