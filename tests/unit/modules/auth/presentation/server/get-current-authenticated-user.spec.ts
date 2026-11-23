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
import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user-use-case';
import { getCurrentAuthenticatedUser } from '@/modules/auth/presentation/server/get-current-authenticated-user';

jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));
jest.mock('@/modules/auth/infra/factories/make-get-current-user-use-case', () => ({
  makeGetCurrentUserUseCase: jest.fn(),
}));

const getAuthenticatedUserIdMock = jest.mocked(getAuthenticatedUserId);
const makeGetCurrentUserUseCaseMock = jest.mocked(makeGetCurrentUserUseCase);

describe('getCurrentAuthenticatedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should go to the session-ended notice when there is no valid session', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(getCurrentAuthenticatedUser()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(SESSION_ENDED_URL);

    expect(makeGetCurrentUserUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return current authenticated user', async () => {
    const execute = jest.fn().mockResolvedValueOnce({
      user: {
        id: 'user-id',
        name: 'Admin Local',
        email: 'admin@financecontrol.com',
      },
    });

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetCurrentUserUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetCurrentUserUseCase>);

    await expect(getCurrentAuthenticatedUser()).resolves.toEqual({
      data: {
        id: 'user-id',
        name: 'Admin Local',
        email: 'admin@financecontrol.com',
      },
    });
    expect(execute).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('should return generic error when current user loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeGetCurrentUserUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeGetCurrentUserUseCase>);

    await expect(getCurrentAuthenticatedUser()).resolves.toEqual({
      error: 'Não foi possível carregar o usuário atual.',
    });
  });
});
