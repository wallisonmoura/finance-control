jest.mock('@/modules/auth/infra/services/jose-jwt-token.adapter', () => ({
  JoseJwtTokenService: jest.fn(),
}));

import { POST } from '@/app/api/auth/register/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { JoseJwtTokenService } from '@/modules/auth/infra/services/jose-jwt-token.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';

const JoseJwtTokenServiceMock = JoseJwtTokenService as unknown as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
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

describe('POST /api/auth/register', () => {
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

  it('should register a new user, set the auth cookie, and return 201 with no password leaked', async () => {
    const email = `nova-${Date.now()}@email.com`;

    const response = await POST(
      makeRequest({ name: 'Nova Usuária', email, password: '12345678' }),
    );

    const body = await response.json();
    const setCookie = response.headers.get('set-cookie');

    expect(response.status).toBe(201);
    expect(body).toEqual({
      user: {
        id: expect.any(String),
        name: 'Nova Usuária',
        email,
      },
    });
    expect(JSON.stringify(body)).not.toContain('password');
    expect(JSON.stringify(body)).not.toContain('accessToken');

    expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=fake-access-token`);
    expect(setCookie).toContain('Max-Age=604800');
  });

  it('should provision exactly one wallet and 26 expense categories for the new user', async () => {
    const email = `provisioning-${Date.now()}@email.com`;

    const response = await POST(
      makeRequest({ name: 'Nova Usuária', email, password: '12345678' }),
    );

    const body = await response.json();
    const userId: string = body.user.id;

    const wallets = await prisma.wallet.findMany({ where: { userId } });
    const categories = await prisma.expenseCategory.findMany({
      where: { userId },
    });

    expect(wallets).toHaveLength(1);
    expect(categories).toHaveLength(26);
  });

  it('should return 409 when the email is already registered', async () => {
    const email = `duplicada-${Date.now()}@email.com`;

    await POST(
      makeRequest({ name: 'Primeira Usuária', email, password: '12345678' }),
    );

    const response = await POST(
      makeRequest({ name: 'Segunda Usuária', email, password: '12345678' }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toHaveProperty('message');
  });

  it('should return 400 when the payload is invalid', async () => {
    const response = await POST(
      makeRequest({ name: '', email: 'email-invalido', password: '123' }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message: 'Erro de validação.',
      issues: expect.any(Array),
    });
  });
});
