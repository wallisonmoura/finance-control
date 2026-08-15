import { POST } from '@/app/api/auth/sign-in/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeLoginRateLimiter } from '@/modules/auth/infra/factories/make-login-rate-limiter';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { NextRequest } from 'next/server';

jest.mock('@/modules/auth/infra/factories/make-sign-in-use-case', () => ({
  makeSignInUseCase: jest.fn(),
}));

jest.mock('@/modules/auth/infra/factories/make-login-rate-limiter', () => ({
  makeLoginRateLimiter: jest.fn(),
}));

describe('POST /api/auth/sign-in', () => {
  beforeEach(() => {
    (makeLoginRateLimiter as jest.Mock).mockReturnValue({
      isBlocked: jest.fn().mockResolvedValue(false),
      registerFailedAttempt: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('should authenticate with valid credentials and set cookie', async () => {
    const execute = jest.fn().mockResolvedValue({
      accessToken: 'fake-access-token',
    });

    (makeSignInUseCase as jest.Mock).mockReturnValue({
      execute,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@financecontrol.com',
        password: '123456',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const setCookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);

    expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=fake-access-token`);
    expect(setCookie).toContain('Max-Age=604800');
  });

  it('should return 401 with invalid credentials', async () => {
    const execute = jest.fn().mockRejectedValue(new InvalidCredentialsError());

    (makeSignInUseCase as jest.Mock).mockReturnValue({
      execute,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@financecontrol.com',
        password: 'senha-invalida',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('should return 400 when payload is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: 'email-invalido',
        password: '',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message: 'Erro de validação.',
      issues: expect.any(Array),
    });
  });

  it('should return 500 when an unexpected error occurs during sign-in', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('Unexpected error'));

    (makeSignInUseCase as jest.Mock).mockReturnValue({
      execute,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@financecontrol.com',
        password: '123456',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message: 'Erro interno do servidor.',
    });
  });
});
