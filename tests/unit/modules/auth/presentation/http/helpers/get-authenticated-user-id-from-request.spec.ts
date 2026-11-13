jest.mock('@/modules/auth/infra/factories/make-resolve-session-use-case', () => ({
  makeResolveSessionUseCase: jest.fn(),
}));

import { NextRequest } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';

const makeResolveSessionUseCaseMock = makeResolveSessionUseCase as jest.MockedFunction<
  typeof makeResolveSessionUseCase
>;

describe('getAuthenticatedUserIdFromRequest', () => {
  afterEach(() => jest.clearAllMocks());

  it('should return null without a cookie', async () => {
    const request = new NextRequest('http://localhost:3000/api/wallet');

    await expect(getAuthenticatedUserIdFromRequest(request)).resolves.toBeNull();
    expect(makeResolveSessionUseCaseMock).not.toHaveBeenCalled();
  });

  it('should delegate to the session use case', async () => {
    const execute = jest.fn().mockResolvedValue('user-1');
    makeResolveSessionUseCaseMock.mockReturnValue({ execute } as never);
    const request = new NextRequest('http://localhost:3000/api/wallet');
    request.cookies.set(AUTH_COOKIE_NAME, 'the-token');

    await expect(getAuthenticatedUserIdFromRequest(request)).resolves.toBe('user-1');
    expect(execute).toHaveBeenCalledWith('the-token');
  });
});
