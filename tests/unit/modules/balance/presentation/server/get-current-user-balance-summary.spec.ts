import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeGetBalanceSummaryUseCase } from '@/modules/balance/infra/factories/make-get-balance-summary-use-case';
import { getCurrentUserBalanceSummary } from '@/modules/balance/presentation/server/get-current-user-balance-summary';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));
jest.mock(
  '@/modules/balance/infra/factories/make-get-balance-summary-use-case',
  () => ({
    makeGetBalanceSummaryUseCase: jest.fn(),
  }),
);

const getAuthenticatedUserIdMock = jest.mocked(getAuthenticatedUserId);
const makeGetBalanceSummaryUseCaseMock = jest.mocked(
  makeGetBalanceSummaryUseCase,
);

describe('getCurrentUserBalanceSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(getCurrentUserBalanceSummary()).resolves.toEqual({
      error: 'Não autenticado',
    });

    expect(makeGetBalanceSummaryUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return balance summary for the authenticated user', async () => {
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

    const execute = jest.fn().mockResolvedValueOnce(summary);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetBalanceSummaryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetBalanceSummaryUseCase>);

    await expect(getCurrentUserBalanceSummary()).resolves.toEqual({
      data: summary,
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });

  it('should return wallet error message when wallet is not found', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(new WalletNotFoundError('user-id'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetBalanceSummaryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetBalanceSummaryUseCase>);

    await expect(getCurrentUserBalanceSummary()).resolves.toEqual({
      error: 'Wallet não encontrada para o usuário "user-id".',
    });
  });

  it('should return generic error message when summary loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetBalanceSummaryUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetBalanceSummaryUseCase>);

    await expect(getCurrentUserBalanceSummary()).resolves.toEqual({
      error: 'Não foi possível carregar o resumo financeiro.',
    });
  });
});
