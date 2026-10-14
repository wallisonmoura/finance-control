import { act, renderHook, waitFor } from '@testing-library/react';

import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';
import { MonthlySummaryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { useIncomeGoalHistory } from '@/modules/reports/presentation/ui/hooks/use-income-goal-history';
import { ReportsPeriodMonths } from '@/modules/reports/presentation/ui/utils/reports-period';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-10-10',
}));

const rangeMock = jest.mocked(financeApiService.getMonthlySummaryRange);

function summaries(months: number): MonthlySummaryUi[] {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9 - (months - 1) + index, 1));
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      totalIncome: 3000,
      totalExpense: 1000,
      result: 2000,
    };
  });
}

const targets = { revenueTarget: 6000, profitTarget: 2000 };

describe('useIncomeGoalHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should load the period and build the history of the measure', async () => {
    rangeMock.mockResolvedValue({ data: summaries(6) });
    const { result } = renderHook(() => useIncomeGoalHistory('profit', 6, targets));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(rangeMock).toHaveBeenCalledWith(6);
    expect(result.current.history?.months).toHaveLength(6);
    expect(result.current.history?.reached).toEqual({ count: 5, closedMonths: 5 });
    expect(result.current.range).toEqual({ startDate: '2026-05-01', endDate: '2026-10-31' });
  });

  it('should expose the API error', async () => {
    rangeMock.mockResolvedValue({ error: 'Falhou.' });
    const { result } = renderHook(() => useIncomeGoalHistory('revenue', 6, targets));

    await waitFor(() => expect(result.current.error).toBe('Falhou.'));
    expect(result.current.history).toBeNull();
  });

  it('should keep only the latest response when the period changes fast', async () => {
    let resolveSlow: (value: { data: MonthlySummaryUi[] }) => void = () => {};
    rangeMock
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSlow = resolve; }))
      .mockResolvedValueOnce({ data: summaries(12) });

    const { result, rerender } = renderHook(
      ({ months }: { months: ReportsPeriodMonths }) => useIncomeGoalHistory('revenue', months, targets),
      { initialProps: { months: 3 as ReportsPeriodMonths } },
    );
    rerender({ months: 12 });
    await waitFor(() => expect(result.current.history?.months).toHaveLength(12));

    await act(async () => resolveSlow({ data: summaries(3) }));
    expect(result.current.history?.months).toHaveLength(12);
  });

  it('should recalculate with new targets without fetching again', async () => {
    rangeMock.mockResolvedValue({ data: summaries(6) });
    const { result } = renderHook(() => useIncomeGoalHistory('revenue', 6, targets));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.history?.reached?.count).toBe(0);

    act(() => result.current.setTargets({ revenueTarget: 3000, profitTarget: 2000 }));

    expect(result.current.history?.reached?.count).toBe(5);
    expect(rangeMock).toHaveBeenCalledTimes(1);
  });
});
