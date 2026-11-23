// Without a valid session the helpers leave for the login notice (the private
// layout does not run again on a menu navigation, so they must).
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

import { redirect } from 'next/navigation';
import { SESSION_ENDED_URL } from '@/shared/presentation/http/session-ended';
import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeGetWalletUseCase } from '@/modules/wallet/infra/factories/make-get-wallet-use-case';
import { getCurrentUserWallet } from '@/modules/wallet/presentation/server/get-current-user-wallet';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));
jest.mock('@/modules/wallet/infra/factories/make-get-wallet-use-case', () => ({
  makeGetWalletUseCase: jest.fn(),
}));

const getAuthenticatedUserIdMock = jest.mocked(getAuthenticatedUserId);
const makeGetWalletUseCaseMock = jest.mocked(makeGetWalletUseCase);

describe('getCurrentUserWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should go to the session-ended notice when there is no valid session', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(getCurrentUserWallet()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(SESSION_ENDED_URL);

    expect(makeGetWalletUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return wallet for the authenticated user', async () => {
    const wallet = {
      id: 'wallet-id',
      userId: 'user-id',
      bankBalance: 1500,
      cashBalance: 200,
      receivableBalance: 450,
      walletTotal: 2150,
      createdAt: new Date('2026-05-06T03:53:23.214Z'),
      updatedAt: new Date('2026-05-06T05:12:28.557Z'),
    };

    const execute = jest.fn().mockResolvedValueOnce(wallet);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetWalletUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetWalletUseCase>);

    await expect(getCurrentUserWallet()).resolves.toEqual({
      data: {
        ...wallet,
        createdAt: '2026-05-06T03:53:23.214Z',
        updatedAt: '2026-05-06T05:12:28.557Z',
      },
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
    makeGetWalletUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetWalletUseCase>);

    await expect(getCurrentUserWallet()).resolves.toEqual({
      error: 'Wallet não encontrada para o usuário "user-id".',
    });
  });

  it('should return generic error message when wallet loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetWalletUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetWalletUseCase>);

    await expect(getCurrentUserWallet()).resolves.toEqual({
      error: 'Não foi possível carregar a Wallet.',
    });
  });
});
