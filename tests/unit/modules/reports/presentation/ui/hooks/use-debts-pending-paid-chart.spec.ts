import { renderHook, waitFor } from '@testing-library/react';

import { useDebtsPendingPaidChart } from '@/modules/reports/presentation/ui/hooks/use-debts-pending-paid-chart';
import * as debtApiService from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-08-22',
}));

const getDebtsMock = jest.mocked(debtApiService.getDebts);

describe('useDebtsPendingPaidChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should bucket pending debts by dueDate month and paid debts by paidAt month', async () => {
    getDebtsMock.mockResolvedValue({
      data: [
        {
          id: '1',
          userId: 'u1',
          description: 'Cartão',
          amount: 200,
          dueDate: '2026-08-10',
          type: 'ONE_TIME',
          status: 'PENDING',
          notes: null,
          paidAt: null,
          paymentSource: null,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'u1',
          description: 'Internet',
          amount: 100,
          dueDate: '2026-07-05',
          type: 'ONE_TIME',
          status: 'PAID',
          notes: null,
          paidAt: '2026-08-06',
          paymentSource: 'BANK',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          userId: 'u1',
          description: 'Fora da janela',
          amount: 999,
          dueDate: '2020-01-01',
          type: 'ONE_TIME',
          status: 'PENDING',
          notes: null,
          paidAt: null,
          paymentSource: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });

    const { result } = renderHook(() => useDebtsPendingPaidChart(3));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([
      { monthLabel: 'jun/26', pendingTotal: 0, paidTotal: 0 },
      { monthLabel: 'jul/26', pendingTotal: 0, paidTotal: 0 },
      { monthLabel: 'ago/26', pendingTotal: 200, paidTotal: 100 },
    ]);
  });

  it('should set error when the request fails', async () => {
    getDebtsMock.mockResolvedValue({ error: 'Falha ao buscar' });

    const { result } = renderHook(() => useDebtsPendingPaidChart(3));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha ao buscar');
    expect(result.current.data).toEqual([]);
  });
});
