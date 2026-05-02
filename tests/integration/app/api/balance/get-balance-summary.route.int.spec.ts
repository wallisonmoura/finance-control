import { GET } from '@/app/api/balance/summary/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestDebt } from 'tests/helpers/database/create-test-debt';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

describe('GET /api/balance/summary', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  it('deve retornar 200 com o balance summary do usuário autenticado', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 400,
      status: DebtStatus.PENDING,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150,
      status: DebtStatus.PENDING,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost/api/balance/summary', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      wallet: {
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: 300,
        walletTotal: 1500,
      },
      debts: {
        pendingDebts: 550,
      },
      finalBalance: 950,
    });
  });

  it('deve retornar 200 com finalBalance negativo quando pendingDebts for maior que walletTotal', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 50,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 500,
      status: DebtStatus.PENDING,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost/api/balance/summary', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      wallet: {
        bankBalance: 100,
        cashBalance: 50,
        receivableBalance: 50,
        walletTotal: 200,
      },
      debts: {
        pendingDebts: 500,
      },
      finalBalance: -300,
    });
  });

  it('deve retornar 401 quando usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/balance/summary', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar erro quando o usuário não possuir wallet', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost/api/balance/summary', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('message');
  });
});
