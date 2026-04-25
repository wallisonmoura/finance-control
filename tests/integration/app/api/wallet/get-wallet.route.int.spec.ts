import { GET } from '@/app/api/wallet/route';
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

describe('GET /api/wallet', () => {
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

  it('deve retornar 200 com a wallet do usuário autenticado', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 25,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: expect.any(String),
      userId: user.id,
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 25,
      walletTotal: 175,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/wallet', {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
