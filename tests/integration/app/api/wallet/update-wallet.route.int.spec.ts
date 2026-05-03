import { PUT } from '@/app/api/wallet/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.MockedFunction<
    typeof getAuthenticatedUserIdFromRequest
  >;

describe('PUT /api/wallet', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('deve retornar 200 e atualizar a wallet do usuário autenticado', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 10,
      cashBalance: 20,
      receivableBalance: 30,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'PUT',
      body: JSON.stringify({
        bankBalance: 100,
        cashBalance: 200,
        receivableBalance: 300,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: wallet.id,
      userId: user.id,
      bankBalance: 100,
      cashBalance: 200,
      receivableBalance: 300,
      walletTotal: 600,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const walletInDatabase = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(Number(walletInDatabase?.bankBalance)).toBe(100);
    expect(Number(walletInDatabase?.cashBalance)).toBe(200);
    expect(Number(walletInDatabase?.receivableBalance)).toBe(300);
  });

  it('deve retornar 400 quando o payload for inválido', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'PUT',
      body: JSON.stringify({
        bankBalance: -1,
        cashBalance: 200,
        receivableBalance: 300,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'PUT',
      body: JSON.stringify({
        bankBalance: 100,
        cashBalance: 200,
        receivableBalance: 300,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await PUT(request);

    expect(response.status).toBe(401);
  });

  it('deve retornar 404 quando tentar atualizar wallet inexistente do usuário autenticado', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'PUT',
      body: JSON.stringify({
        bankBalance: 100,
        cashBalance: 200,
        receivableBalance: 300,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      message: `Wallet not found for user "${user.id}".`,
    });
  });
});
