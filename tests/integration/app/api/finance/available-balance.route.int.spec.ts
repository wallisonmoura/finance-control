import { GET } from '@/app/api/finance/available-balance/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestExpenseCategory } from 'tests/helpers/database/create-test-expense-category';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

describe('GET /api/finance/available-balance', () => {
  const mockedGetAuthenticatedUserIdFromRequest =
    getAuthenticatedUserIdFromRequest as jest.MockedFunction<
      typeof getAuthenticatedUserIdFromRequest
    >;

  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  it('deve retornar o saldo disponível do usuário autenticado', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Combustível',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 1000,
          description: 'Receita 1',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          expenseCategoryId: category.id,
          type: 'EXPENSE',
          amount: 300,
          description: 'Despesa 1',
          transactionDate: new Date(2026, 3, 6),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/available-balance',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      totalIncome: 1000,
      totalExpense: 300,
      balance: 700,
    });
  });

  it('deve retornar 401 quando não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/available-balance',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('deve considerar apenas os lançamentos do usuário autenticado', async () => {
    const user1 = await createTestUser();
    const user2 = await prisma.user.create({
      data: {
        name: 'User 2',
        email: 'available-balance-user2@test.com',
        passwordHash: 'hash',
      },
    });
    const wallet1 = await createTestWallet({
      userId: user1.id,
      isDefault: true,
    });

    const wallet2 = await prisma.wallet.create({
      data: {
        userId: user2.id,
        name: 'Carteira User 2',
        isDefault: true,
      },
    });

    const category1 = await createTestExpenseCategory({
      userId: user1.id,
      name: 'Combustível',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user1.id,
          walletId: wallet1.id,
          type: 'INCOME',
          amount: 1000,
          description: 'Receita User 1',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user1.id,
          walletId: wallet1.id,
          expenseCategoryId: category1.id,
          type: 'EXPENSE',
          amount: 250,
          description: 'Despesa User 1',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user2.id,
          walletId: wallet2.id,
          type: 'INCOME',
          amount: 9999,
          description: 'Receita User 2',
          transactionDate: new Date(2026, 3, 6),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user1.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/available-balance',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      totalIncome: 1000,
      totalExpense: 250,
      balance: 750,
    });
  });
});
