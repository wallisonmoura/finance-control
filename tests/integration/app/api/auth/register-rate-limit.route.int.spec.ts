jest.mock('@/modules/auth/infra/services/jose-jwt-token.adapter', () => ({
  JoseJwtTokenAdapter: jest.fn(),
}));

import { POST } from '@/app/api/auth/register/route';
import { AUTH_TOO_MANY_REGISTER_ATTEMPTS_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { JoseJwtTokenAdapter } from '@/modules/auth/infra/services/jose-jwt-token.adapter';
import { PrismaRateLimiterAdapter } from '@/modules/auth/infra/services/prisma-rate-limiter.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';

const JoseJwtTokenServiceMock = JoseJwtTokenAdapter as unknown as jest.Mock;

function makeRequest(ip: string, email: string) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Nova Usuária',
      email,
      password: '12345678',
    }),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
  });
}

async function cleanDatabase() {
  await prisma.transaction.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.loginAttempt.deleteMany();
}

describe('POST /api/auth/register — rate limiting', () => {
  const ip = '203.0.113.99';

  beforeEach(async () => {
    await cleanDatabase();

    JoseJwtTokenServiceMock.mockImplementation(() => ({
      generateAccessToken: jest.fn().mockResolvedValue('fake-access-token'),
    }));
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should return 429 after 5 successful registrations from the same ip, unlike sign-in which only counts failures', async () => {
    for (let i = 0; i < 5; i += 1) {
      const response = await POST(
        makeRequest(ip, `reg-success-${i}-${Date.now()}@email.com`),
      );
      expect(response.status).toBe(201);
    }

    const response = await POST(
      makeRequest(ip, `reg-6th-${Date.now()}@email.com`),
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({
      message: AUTH_TOO_MANY_REGISTER_ATTEMPTS_MESSAGE,
    });
  });

  it('should count failed (duplicate email) attempts toward the same quota as successes', async () => {
    const duplicateEmail = `reg-dup-${Date.now()}@email.com`;

    await POST(makeRequest(ip, duplicateEmail));

    for (let i = 0; i < 4; i += 1) {
      const response = await POST(makeRequest(ip, duplicateEmail));
      expect(response.status).toBe(409);
    }

    const response = await POST(
      makeRequest(ip, `reg-after-dup-${Date.now()}@email.com`),
    );

    expect(response.status).toBe(429);
  });

  it('should not block a different ip', async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest(ip, `reg-block-${i}-${Date.now()}@email.com`));
    }

    const response = await POST(
      makeRequest('198.51.100.88', `reg-other-${Date.now()}@email.com`),
    );

    expect(response.status).toBe(201);
  });

  // A database failure in the limiter must answer like any other server error:
  // the standard JSON body, and logged by toErrorNextResponse.
  describe('when the rate limiter fails', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each(['isBlocked', 'registerAttempt'] as const)(
      'should return the standard 500 when %s fails',
      async (method) => {
        jest
          .spyOn(PrismaRateLimiterAdapter.prototype, method)
          .mockRejectedValueOnce(new Error('db down'));

        const response = await POST(makeRequest(ip, 'falha@teste.com'));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ message: 'Erro interno do servidor.' });
      },
    );
  });
});
