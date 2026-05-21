import { renderHook, waitFor } from '@testing-library/react';

import { usePendingDebts } from '@/modules/debts/presentation/ui/hooks/use-pending-debts';
import { getPendingDebts } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service');

const getPendingDebtsMock = jest.mocked(getPendingDebts);

describe('usePendingDebts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load pending debts', async () => {
    const debts = [
      {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 300,
        dueDate: '2026-05-20T00:00:00.000Z',
        type: 'ONE_TIME' as const,
        status: 'PENDING' as const,
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    ];

    getPendingDebtsMock.mockResolvedValueOnce({
      data: debts,
    });

    const { result } = renderHook(() => usePendingDebts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.debts).toEqual(debts);
    expect(result.current.error).toBeNull();
  });

  it('should expose error when loading pending debts fails', async () => {
    getPendingDebtsMock.mockResolvedValueOnce({
      error: 'Não foi possível carregar dívidas pendentes.',
    });

    const { result } = renderHook(() => usePendingDebts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.debts).toEqual([]);
    expect(result.current.error).toBe(
      'Não foi possível carregar dívidas pendentes.',
    );
  });
});
