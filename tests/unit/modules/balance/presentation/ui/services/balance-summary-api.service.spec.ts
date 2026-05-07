import { getBalanceSummary } from '@/modules/balance/presentation/ui/services/balance-summary-api.service';

describe('getBalanceSummary', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = fetchMock;
  });

  it('should return data when request succeeds', async () => {
    const summary = {
      wallet: {
        bankBalance: 1500,
        cashBalance: 200,
        receivableBalance: 450,
        walletTotal: 2150,
      },
      debts: {
        pendingDebts: 300,
      },
      finalBalance: 1850,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => summary,
    });

    await expect(getBalanceSummary()).resolves.toEqual({
      data: summary,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/balance/summary', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('should return api message when request fails with message field', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Não autenticado',
      }),
    });

    await expect(getBalanceSummary()).resolves.toEqual({
      error: 'Não autenticado',
    });
  });

  it('should return api error when request fails with error field', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Erro interno',
      }),
    });

    await expect(getBalanceSummary()).resolves.toEqual({
      error: 'Erro interno',
    });
  });

  it('should return default message when request fails without valid json body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(getBalanceSummary()).resolves.toEqual({
      error: 'Não foi possível carregar o resumo financeiro.',
    });
  });

  it('should return default message when request fails without message or error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(getBalanceSummary()).resolves.toEqual({
      error: 'Não foi possível carregar o resumo financeiro.',
    });
  });
});
