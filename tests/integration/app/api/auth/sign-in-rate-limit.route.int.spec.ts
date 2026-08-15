import { POST } from '@/app/api/auth/sign-in/route';
import { AUTH_TOO_MANY_ATTEMPTS_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';

jest.mock('@/modules/auth/infra/factories/make-sign-in-use-case', () => ({
  makeSignInUseCase: jest.fn(),
}));

function makeRequest(ip: string) {
  return new NextRequest('http://localhost:3000/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@financecontrol.com',
      password: 'senha-invalida',
    }),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
  });
}

describe('POST /api/auth/sign-in — rate limiting', () => {
  const ip = '203.0.113.55';

  beforeEach(async () => {
    await prisma.loginAttempt.deleteMany();

    (makeSignInUseCase as jest.Mock).mockReturnValue({
      execute: jest.fn().mockRejectedValue(new InvalidCredentialsError()),
    });
  });

  afterAll(async () => {
    await prisma.loginAttempt.deleteMany();
    await prisma.$disconnect();
  });

  it('should return 401 for each of the first 5 failed attempts from the same ip', async () => {
    for (let i = 0; i < 5; i += 1) {
      const response = await POST(makeRequest(ip));
      expect(response.status).toBe(401);
    }
  });

  it('should return 429 on the 6th failed attempt within the window', async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest(ip));
    }

    const response = await POST(makeRequest(ip));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({ message: AUTH_TOO_MANY_ATTEMPTS_MESSAGE });
  });

  it('should not block a different ip', async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest(ip));
    }

    const response = await POST(makeRequest('198.51.100.77'));

    expect(response.status).toBe(401);
  });
});
