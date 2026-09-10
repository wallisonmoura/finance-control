import { renderHook, waitFor } from '@testing-library/react';

import { useDebtsPaidChart } from '@/modules/reports/presentation/ui/hooks/use-debts-paid-chart';
import * as debtApiService from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-08-22',
}));

const getDebtsMock = jest.mocked(debtApiService.getDebts);

describe('useDebtsPaidChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should bucket paid debts by paidAt month, summing all types together', async () => {
    getDebtsMock.mockResolvedValue({
      data: [
        {
          id: '1',
          userId: 'u1',
          description: 'IPVA',
          amount: 200,
          dueDate: '2026-08-05',
          type: 'ONE_TIME',
          status: 'PAID',
          notes: null,
          paidAt: '2026-08-06',
          paymentSource: 'BANK',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'u1',
          description: 'Geladeira 3/4',
          amount: 150,
          dueDate: '2026-08-10',
          type: 'INSTALLMENT',
          status: 'PAID',
          notes: null,
          paidAt: '2026-08-11',
          paymentSource: 'CASH',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          userId: 'u1',
          description: 'Cartão de crédito',
          amount: 300,
          dueDate: '2026-07-10',
          type: 'RECURRING',
          status: 'PAID',
          notes: null,
          paidAt: '2026-07-12',
          paymentSource: 'BANK',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '4',
          userId: 'u1',
          description: 'Ainda pendente',
          amount: 999,
          dueDate: '2026-08-20',
          type: 'ONE_TIME',
          status: 'PENDING',
          notes: null,
          paidAt: null,
          paymentSource: null,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '5',
          userId: 'u1',
          description: 'Fora da janela',
          amount: 999,
          dueDate: '2020-01-01',
          type: 'RECURRING',
          status: 'PAID',
          notes: null,
          paidAt: '2020-01-02',
          paymentSource: 'BANK',
          createdAt: '',
          updatedAt: '',
        },
      ],
    });

    const { result } = renderHook(() => useDebtsPaidChart(3));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([
      { monthLabel: 'jun/26', total: 0 },
      { monthLabel: 'jul/26', total: 300 },
      { monthLabel: 'ago/26', total: 350 },
    ]);
  });

  it('should set error when the request fails', async () => {
    getDebtsMock.mockResolvedValue({ error: 'Falha ao buscar' });

    const { result } = renderHook(() => useDebtsPaidChart(3));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Falha ao buscar');
    expect(result.current.data).toEqual([]);
  });
});
