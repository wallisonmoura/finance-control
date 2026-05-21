import {
  getWallet,
  updateWalletBalances,
} from '@/modules/wallet/presentation/ui/services/wallet-api.service';

const walletResponse = {
  id: 'wallet-id',
  userId: 'user-id',
  bankBalance: 1500,
  cashBalance: 200,
  receivableBalance: 450,
  createdAt: '2026-05-06T03:53:23.214Z',
  updatedAt: '2026-05-06T05:12:28.557Z',
  walletTotal: 2150,
};

describe('wallet-api.service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('getWallet', () => {
    it('deve buscar a Wallet do usuário autenticado', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => walletResponse,
      } as Response);

      const response = await getWallet();

      expect(global.fetch).toHaveBeenCalledWith('/api/wallet', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      expect(response).toEqual({
        data: walletResponse,
      });
    });

    it('deve retornar mensagem de erro vinda de body.message', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Wallet não encontrada.',
        }),
      } as Response);

      const response = await getWallet();

      expect(response).toEqual({
        error: 'Wallet não encontrada.',
      });
    });

    it('deve retornar mensagem de erro vinda de body.error', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Erro ao buscar Wallet.',
        }),
      } as Response);

      const response = await getWallet();

      expect(response).toEqual({
        error: 'Erro ao buscar Wallet.',
      });
    });

    it('deve retornar mensagem padrão quando o body de erro não for JSON válido', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const response = await getWallet();

      expect(response).toEqual({
        error: 'Não foi possível processar a solicitação da Wallet.',
      });
    });

    it('deve retornar mensagem padrão quando o body não possuir message nem error', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      const response = await getWallet();

      expect(response).toEqual({
        error: 'Não foi possível processar a solicitação da Wallet.',
      });
    });
  });

  describe('updateWalletBalances', () => {
    it('deve atualizar os saldos-base da Wallet', async () => {
      const payload = {
        bankBalance: 1500,
        cashBalance: 200,
        receivableBalance: 800,
      };

      const updatedWalletResponse = {
        ...walletResponse,
        ...payload,
        updatedAt: '2026-05-07T19:39:34.551Z',
        walletTotal: 2500,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedWalletResponse,
      } as Response);

      const response = await updateWalletBalances(payload);

      expect(global.fetch).toHaveBeenCalledWith('/api/wallet', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      expect(response).toEqual({
        data: updatedWalletResponse,
      });
    });

    it('deve retornar erro quando a atualização falhar com body.message', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Payload inválido.',
        }),
      } as Response);

      const response = await updateWalletBalances({
        bankBalance: -1,
        cashBalance: 200,
        receivableBalance: 800,
      });

      expect(response).toEqual({
        error: 'Payload inválido.',
      });
    });

    it('deve retornar erro quando a atualização falhar com body.error', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Erro ao atualizar Wallet.',
        }),
      } as Response);

      const response = await updateWalletBalances({
        bankBalance: 1500,
        cashBalance: 200,
        receivableBalance: 800,
      });

      expect(response).toEqual({
        error: 'Erro ao atualizar Wallet.',
      });
    });

    it('deve retornar mensagem padrão quando o body de erro da atualização não for JSON válido', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const response = await updateWalletBalances({
        bankBalance: 1500,
        cashBalance: 200,
        receivableBalance: 800,
      });

      expect(response).toEqual({
        error: 'Não foi possível processar a solicitação da Wallet.',
      });
    });
  });
});
