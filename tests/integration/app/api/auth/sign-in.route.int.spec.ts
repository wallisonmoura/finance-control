import { POST } from '@/app/api/auth/sign-in/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { NextRequest } from 'next/server';

jest.mock('@/modules/auth/infra/factories/make-sign-in-use-case', () => ({
  makeSignInUseCase: jest.fn(),
}));

describe('POST /api/auth/sign-in', () => {
  it('deve autenticar com credenciais válidas e definir cookie', async () => {
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
  });

  it('deve retornar 401 com credenciais inválidas', async () => {
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

  it('deve retornar 400 quando o payload for inválido', async () => {
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
      message: 'Dados de entrada inválidos',
      issues: expect.any(Array),
    });
  });

  it('deve retornar 500 quando ocorrer erro inesperado no sign-in', async () => {
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
      message: 'Erro interno do servidor',
    });
  });
});
