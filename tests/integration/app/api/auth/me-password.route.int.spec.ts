jest.mock(
  '@/modules/auth/infra/factories/make-change-password-use-case',
  () => ({
    makeChangePasswordUseCase: jest.fn(),
  }),
);

// The session check itself (token + password change) is covered by
// resolve-session.use-case tests; here it only says who is signed in.
jest.mock('@/modules/auth/infra/factories/make-resolve-session-use-case', () => ({
  makeResolveSessionUseCase: jest.fn(),
}));

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-auth-token-from-request',
  () => ({
    getAuthTokenFromRequest: jest.fn(),
  }),
);

import { PUT } from '@/app/api/auth/me/password/route';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeChangePasswordUseCase } from '@/modules/auth/infra/factories/make-change-password-use-case';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';
import { getAuthTokenFromRequest } from '@/modules/auth/presentation/http/helpers/get-auth-token-from-request';
import { NextRequest } from 'next/server';

const makeChangePasswordUseCaseMock =
  makeChangePasswordUseCase as jest.MockedFunction<
    typeof makeChangePasswordUseCase
  >;

const resolveSession = jest.fn();

(makeResolveSessionUseCase as jest.Mock).mockImplementation(() => ({
  execute: resolveSession,
}));

const getAuthTokenFromRequestMock =
  getAuthTokenFromRequest as jest.MockedFunction<
    typeof getAuthTokenFromRequest
  >;

describe('PUT /api/auth/me/password', () => {
  afterEach(() => {
    resolveSession.mockReset();
    jest.clearAllMocks();
  });

  it('should change the authenticated user password with a valid token', async () => {
    const execute = jest.fn().mockResolvedValue({ accessToken: 'new-token' });

    resolveSession.mockResolvedValue('user-1');

    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest(
      'http://localhost:3000/api/auth/me/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: 'current-password',
          newPassword: 'new-password-123',
        }),
      },
    );

    const response = await PUT(request);
    const body = await response.json();

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({ message: 'Senha alterada com sucesso.' });
  });

  // The change signs out older logins, this device included: it needs the new one.
  it('should set a new auth cookie after changing the password', async () => {
    const execute = jest.fn().mockResolvedValue({ accessToken: 'new-token' });
    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);
    resolveSession.mockResolvedValue('user-1');
    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const response = await PUT(
      new NextRequest('http://localhost:3000/api/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: 'current-password', newPassword: 'new-password-123' }),
      }),
    );

    expect(response.cookies.get('fc_access_token')?.value).toBe('new-token');
    expect(await response.json()).not.toHaveProperty('accessToken');
  });

  it('should return 401 without a token', async () => {
    getAuthTokenFromRequestMock.mockReturnValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/me/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: 'current-password',
          newPassword: 'new-password-123',
        }),
      },
    );

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('should return 400 for a new password shorter than 8 characters', async () => {
    resolveSession.mockResolvedValue('user-1');

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest(
      'http://localhost:3000/api/auth/me/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: 'current-password',
          newPassword: '123',
        }),
      },
    );

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it('should return 401 when the current password does not match', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(new InvalidCredentialsError());

    resolveSession.mockResolvedValue('user-1');

    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest(
      'http://localhost:3000/api/auth/me/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: 'wrong-password',
          newPassword: 'new-password-123',
        }),
      },
    );

    const response = await PUT(request);

    expect(response.status).toBe(401);
  });

  it('should not set a cookie when the current password is wrong', async () => {
    const execute = jest.fn().mockRejectedValue(new InvalidCredentialsError());
    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);
    resolveSession.mockResolvedValue('user-1');
    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const response = await PUT(
      new NextRequest('http://localhost:3000/api/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: 'wrong-password', newPassword: 'new-password-123' }),
      }),
    );

    expect(response.status).toBe(401);
    expect(response.cookies.get('fc_access_token')).toBeUndefined();
  });
});
