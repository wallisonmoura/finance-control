import { act, renderHook } from '@testing-library/react';

import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';
import { getFinanceHistory } from '@/modules/finance/presentation/ui/services/finance-api.service';
import { FinanceHistoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');

const getFinanceHistoryMock = jest.mocked(getFinanceHistory);

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return {
    promise,
    resolve,
  };
}

describe('useFinanceHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should ignore stale history responses when filters change quickly', async () => {
    const staleResponse = createDeferred<{ data: FinanceHistoryUi }>();

    getFinanceHistoryMock
      .mockReturnValueOnce(staleResponse.promise)
      .mockResolvedValueOnce({
        data: {
          entries: [],
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        },
      });

    const { result } = renderHook(() =>
      useFinanceHistory({
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      }),
    );

    await act(async () => {
      await result.current.applyFilters({
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      });
    });

    expect(result.current.totalIncome).toBe(0);
    expect(result.current.totalExpense).toBe(0);
    expect(result.current.balance).toBe(0);

    await act(async () => {
      staleResponse.resolve({
        data: {
          entries: [],
          totalIncome: 1590,
          totalExpense: 1446.55,
          balance: 143.45,
        },
      });
    });

    expect(result.current.totalIncome).toBe(0);
    expect(result.current.totalExpense).toBe(0);
    expect(result.current.balance).toBe(0);
  });
});
