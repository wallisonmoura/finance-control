jest.mock(
  '@/modules/auth/infra/factories/make-get-current-user.use-case',
  () => ({
    makeGetCurrentUserUseCase: jest.fn(),
  }),
);

jest.mock('@/modules/auth/infra/services/jose-jwt-token.service', () => ({
  JoseJwtTokenService: jest.fn(),
}));

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-auth-token-from-request',
  () => ({
    getAuthTokenFromRequest: jest.fn(),
  }),
);

import { GET } from '@/app/api/auth/me/route';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user.use-case';
import { JoseJwtTokenService } from '@/modules/auth/infra/services/jose-jwt-token.service';
import { getAuthTokenFromRequest } from '@/modules/auth/presentation/http/helpers/get-auth-token-from-request';
import { NextRequest } from 'next/server';

const makeGetCurrentUserUseCaseMock =
  makeGetCurrentUserUseCase as jest.MockedFunction<
    typeof makeGetCurrentUserUseCase
  >;

const JoseJwtTokenServiceMock = JoseJwtTokenService as unknown as jest.Mock;

const getAuthTokenFromRequestMock =
  getAuthTokenFromRequest as jest.MockedFunction<
    typeof getAuthTokenFromRequest
  >;

describe('GET /api/auth/me', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o usuário autenticado com token válido', async () => {
    const execute = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    });

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'admin@financecontrol.com',
    });

    makeGetCurrentUserUseCaseMock.mockReturnValue({
      execute,
    } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(getAuthTokenFromRequestMock).toHaveBeenCalled();
    expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');
    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    });
  });

  it('deve retornar 401 sem token', async () => {
    getAuthTokenFromRequestMock.mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 401 com token inválido', async () => {
    const execute = jest.fn();

    const verifyAccessToken = jest
      .fn()
      .mockRejectedValue(new Error('Invalid token'));

    makeGetCurrentUserUseCaseMock.mockReturnValue({
      execute,
    } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('invalid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(verifyAccessToken).toHaveBeenCalledWith('invalid-token');
    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 401 quando o usuário do token não existir', async () => {
    const execute = jest.fn().mockRejectedValue(new UserNotFoundError());

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'missing-user',
      email: 'admin@financecontrol.com',
    });

    makeGetCurrentUserUseCaseMock.mockReturnValue({
      execute,
    } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');
    expect(execute).toHaveBeenCalledWith({
      userId: 'missing-user',
    });
    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });
});
