jest.mock(
  '@/modules/auth/infra/factories/make-get-current-user-use-case',
  () => ({
    makeGetCurrentUserUseCase: jest.fn(),
  }),
);

jest.mock(
  '@/modules/auth/infra/factories/make-update-user-profile-use-case',
  () => ({
    makeUpdateUserProfileUseCase: jest.fn(),
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

import { GET, PUT } from '@/app/api/auth/me/route';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { InvalidUserNameError } from '@/modules/auth/domain/errors/invalid-user-name.error';
import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user-use-case';
import { makeUpdateUserProfileUseCase } from '@/modules/auth/infra/factories/make-update-user-profile-use-case';
import { JoseJwtTokenService } from '@/modules/auth/infra/services/jose-jwt-token.adapter';
import { getAuthTokenFromRequest } from '@/modules/auth/presentation/http/helpers/get-auth-token-from-request';
import { NextRequest } from 'next/server';

const makeGetCurrentUserUseCaseMock =
  makeGetCurrentUserUseCase as jest.MockedFunction<
    typeof makeGetCurrentUserUseCase
  >;

const makeUpdateUserProfileUseCaseMock =
  makeUpdateUserProfileUseCase as jest.MockedFunction<
    typeof makeUpdateUserProfileUseCase
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

  it('should return the authenticated user with a valid token', async () => {
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

  it('should return 401 without a token', async () => {
    getAuthTokenFromRequestMock.mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('should return 401 with an invalid token', async () => {
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

  it('should return 401 when the token user does not exist', async () => {
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

describe('PUT /api/auth/me', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the authenticated user name with a valid token', async () => {
    const execute = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Wallison Moura',
        email: 'wallison@financecontrol.com',
      },
    });

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    makeUpdateUserProfileUseCaseMock.mockReturnValue({
      execute,
    } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Wallison Moura' }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Wallison Moura',
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: {
        id: 'user-1',
        name: 'Wallison Moura',
        email: 'wallison@financecontrol.com',
      },
    });
  });

  it('should return 401 without a token', async () => {
    getAuthTokenFromRequestMock.mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Wallison Moura' }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('should return 400 for an empty name', async () => {
    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name: '' }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when the use case throws InvalidUserNameError', async () => {
    const execute = jest.fn().mockRejectedValue(new InvalidUserNameError());

    const verifyAccessToken = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'wallison@financecontrol.com',
    });

    makeUpdateUserProfileUseCaseMock.mockReturnValue({
      execute,
    } as never);

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      verifyAccessToken,
    }));

    getAuthTokenFromRequestMock.mockReturnValue('valid-token');

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name: 'x' }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});
