import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { FinanceHistoryPageContent } from '@/modules/finance/presentation/ui/components/finance-history-page-content';
import { getFinanceHistory } from '@/modules/finance/presentation/ui/services/finance-api.service';
import { FinanceHistoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  ...jest.requireActual(
    '@/modules/finance/presentation/ui/services/finance-api.service',
  ),
  getFinanceHistory: jest.fn(),
}));
jest.mock('next/navigation');

const getFinanceHistoryMock = jest.mocked(getFinanceHistory);
const useRouterMock = jest.mocked(useRouter);
const useSearchParamsMock = jest.mocked(useSearchParams);

const emptyHistory: FinanceHistoryUi = {
  entries: [],
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 },
};

describe('FinanceHistoryPageContent - filter application (real hook)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFinanceHistoryMock.mockResolvedValue({ data: emptyHistory });
  });

  it('should call the history API exactly once when the user applies a new filter', async () => {
    const user = userEvent.setup();

    let currentSearchParams = new URLSearchParams({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
    const rerenderRef: { current?: () => void } = {};

    useSearchParamsMock.mockImplementation(
      () => currentSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );

    // Mirrors real Next.js: router.push() only updates the URL/searchParams
    // that useSearchParams() returns on a *later* render — it is not
    // synchronous with the call site. The microtask delay reproduces that:
    // the direct applyFilters() call in the handler updates `filters`
    // synchronously, and the URL/searchParams catch up one tick later.
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

    const { rerender } = render(
      <FinanceHistoryPageContent initialCategories={[]} />,
    );
    rerenderRef.current = () =>
      rerender(<FinanceHistoryPageContent initialCategories={[]} />);

    await waitFor(() => expect(getFinanceHistoryMock).toHaveBeenCalledTimes(1));

    await user.clear(screen.getByLabelText('Data inicial'));
    await user.type(screen.getByLabelText('Data inicial'), '2026-05-10');
    await user.clear(screen.getByLabelText('Data final'));
    await user.type(screen.getByLabelText('Data final'), '2026-05-20');
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() =>
      expect(getFinanceHistoryMock.mock.calls.length).toBeGreaterThanOrEqual(2),
    );

    // Give any spurious, effect-triggered call a chance to also land before
    // asserting the final count.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getFinanceHistoryMock).toHaveBeenCalledTimes(2);
    expect(getFinanceHistoryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startDate: '2026-05-10',
        endDate: '2026-05-20',
      }),
    );
  });
});
