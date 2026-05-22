import { act, renderHook } from '@testing-library/react';

import { useDebts } from '@/modules/debts/presentation/ui/hooks/use-debts';
import { getDebts } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service');

const getDebtsMock = jest.mocked(getDebts);

describe('useDebts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with server debts', () => {
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

    const { result } = renderHook(() =>
      useDebts({
        initialDebts: debts,
      }),
    );

    expect(result.current.debts).toEqual(debts);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(getDebtsMock).not.toHaveBeenCalled();
  });

  it('should refresh debts', async () => {
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

    getDebtsMock.mockResolvedValueOnce({
      data: debts,
    });

    const { result } = renderHook(() => useDebts());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.debts).toEqual(debts);
    expect(result.current.error).toBeNull();
  });

  it('should expose error when refresh fails', async () => {
    getDebtsMock.mockResolvedValueOnce({
      error: 'Não foi possível carregar dívidas.',
    });

    const { result } = renderHook(() => useDebts());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.debts).toEqual([]);
    expect(result.current.error).toBe('Não foi possível carregar dívidas.');
  });
});
