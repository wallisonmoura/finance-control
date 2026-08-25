jest.mock(
  '@/modules/auth/infra/factories/make-change-password-use-case',
  () => ({
    makeChangePasswordUseCase: jest.fn(),
  }),
);

jest.mock('@/modules/auth/infra/services/jose-jwt-token.adapter', () => ({
  JoseJwtTokenService: jest.fn(),
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
import { JoseJwtTokenService } from '@/modules/auth/infra/services/jose-jwt-token.adapter';
import { getAuthTokenFromRequest } from '@/modules/auth/presentation/http/helpers/get-auth-token-from-request';
import { NextRequest } from 'next/server';

const makeChangePasswordUseCaseMock =
  makeChangePasswordUseCase as jest.MockedFunction<
    typeof makeChangePasswordUseCase
  >;

const JoseJwtTokenServiceMock = JoseJwtTokenService as unknown as jest.Mock;

const getAuthTokenFromRequestMock =
  getAuthTokenFromRequest as jest.MockedFunction<
    typeof getAuthTokenFromRequest
  >;

describe('PUT /api/auth/me/password', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the authenticated user password with a valid token', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

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
    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

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

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    makeChangePasswordUseCaseMock.mockReturnValue({ execute } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

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
});
