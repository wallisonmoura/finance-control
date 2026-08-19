import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { FinanceSummaryPageContent } from '@/modules/finance/presentation/ui/components/finance-summary-page-content';
import {
  getFullFinanceHistory,
  getMonthlySummary,
} from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  ...jest.requireActual(
    '@/modules/finance/presentation/ui/services/finance-api.service',
  ),
  getMonthlySummary: jest.fn(),
  getFullFinanceHistory: jest.fn(),
}));
jest.mock('next/navigation');

const getMonthlySummaryMock = jest.mocked(getMonthlySummary);
const getFullFinanceHistoryMock = jest.mocked(getFullFinanceHistory);
const useRouterMock = jest.mocked(useRouter);
const useSearchParamsMock = jest.mocked(useSearchParams);

describe('FinanceSummaryPageContent - filter application (real hook)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getMonthlySummaryMock.mockResolvedValue({
      data: { year: 2026, month: 5, totalIncome: 0, totalExpense: 0, result: 0 },
    });
    getFullFinanceHistoryMock.mockResolvedValue({
      data: {
        entries: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        pagination: { page: 1, pageSize: 0, totalCount: 0, totalPages: 0 },
      },
    });
  });

  it('should call the summary API exactly once when the user applies a new month filter', async () => {
    const user = userEvent.setup();

    let currentSearchParams = new URLSearchParams({ month: '2026-05' });
    const rerenderRef: { current?: () => void } = {};

    useSearchParamsMock.mockImplementation(
      () => currentSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );

    // Mirrors real Next.js: router.push() only updates the URL/searchParams
    // that useSearchParams() returns on a *later* render — it is not
    // synchronous with the call site.
    const push = jest.fn((url: string) => {
      const queryString = url.split('?')[1] ?? '';

      void Promise.resolve().then(() => {
        currentSearchParams = new URLSearchParams(queryString);
        rerenderRef.current?.();
      });
    });

    useRouterMock.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);

    const { rerender } = render(<FinanceSummaryPageContent />);
    rerenderRef.current = () => rerender(<FinanceSummaryPageContent />);

    await waitFor(() => expect(getMonthlySummaryMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Mês'), {
      target: { value: '2026-04' },
    });
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() =>
      expect(getMonthlySummaryMock.mock.calls.length).toBeGreaterThanOrEqual(2),
    );

    // Give any spurious, effect-triggered call a chance to also land before
    // asserting the final count.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getMonthlySummaryMock).toHaveBeenCalledTimes(2);
    expect(getMonthlySummaryMock).toHaveBeenLastCalledWith({
      year: 2026,
      month: 4,
    });
  });
});
