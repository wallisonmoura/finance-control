import { POST } from '@/app/api/finance/incomes/route';
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

describe('POST /api/finance/incomes', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  it('deve criar uma income com sucesso para usuário autenticado', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/incomes',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 150.5,
          description: 'Corrida do dia',
          date: '2026-04-01',
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      amount: 150.5,
      description: 'Corrida do dia',
      type: 'INCOME',
    });
  });

  it('deve retornar 401 quando não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/incomes',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          description: 'Receita sem auth',
          date: '2026-04-01',
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
