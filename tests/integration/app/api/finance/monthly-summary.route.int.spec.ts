import { GET } from '@/app/api/finance/monthly-summary/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';

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

describe('GET /api/finance/monthly-summary', () => {
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

  it('deve retornar o resumo mensal do mês e ano informados', async () => {
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
          description: 'Receita abril 1',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 500,
          description: 'Receita abril 2',
          transactionDate: new Date(2026, 3, 20),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 300,
          description: 'Despesa abril',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 3, 10),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 80,
          description: 'Despesa de maio',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 4, 1),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026&month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      month: 4,
      year: 2026,
      totalIncome: 1500,
      totalExpense: 300,
      result: 1200,
    });
  });

  it('deve considerar o ano corretamente no resumo mensal', async () => {
    const user = await createTestUser({
      email: 'monthly-summary-year@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      name: 'Carteira principal',
      isDefault: true,
    });
    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Manutenção',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 700,
          description: 'Receita abril 2026',
          transactionDate: new Date(2026, 3, 5),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 200,
          description: 'Despesa abril 2026',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 3, 8),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 9999,
          description: 'Receita abril 2025',
          transactionDate: new Date(2025, 3, 5),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026&month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      month: 4,
      year: 2026,
      totalIncome: 700,
      totalExpense: 200,
      result: 500,
    });
  });

  it('deve retornar 401 quando não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026&month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('deve retornar 400 quando o mês for inválido', async () => {
    const user = await createTestUser({
      email: 'monthly-summary-invalid-month@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026&month=13',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando o ano for inválido', async () => {
    const user = await createTestUser({
      email: 'monthly-summary-invalid-year@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=26&month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando faltar o mês', async () => {
    const user = await createTestUser({
      email: 'monthly-summary-missing-month@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando faltar o ano', async () => {
    const user = await createTestUser({
      email: 'monthly-summary-missing-year@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve considerar apenas os lançamentos do usuário autenticado', async () => {
    const user1 = await createTestUser({
      email: 'monthly-summary-user1@test.com',
    });
    const user2 = await createTestUser({
      email: 'monthly-summary-user2@test.com',
    });

    const wallet1 = await createTestWallet({
      userId: user1.id,
      name: 'Carteira User 1',
      isDefault: true,
    });
    const wallet2 = await createTestWallet({
      userId: user2.id,
      name: 'Carteira User 2',
      isDefault: true,
    });

    const category1 = await createTestExpenseCategory({
      userId: user1.id,
      name: 'Categoria User 1',
    });
    const category2 = await createTestExpenseCategory({
      userId: user2.id,
      name: 'Categoria User 2',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user1.id,
          walletId: wallet1.id,
          type: 'INCOME',
          amount: 1200,
          description: 'Receita User 1',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user1.id,
          walletId: wallet1.id,
          type: 'EXPENSE',
          amount: 400,
          description: 'Despesa User 1',
          expenseCategoryId: category1.id,
          transactionDate: new Date(2026, 3, 7),
        },
        {
          userId: user2.id,
          walletId: wallet2.id,
          type: 'INCOME',
          amount: 9999,
          description: 'Receita User 2',
          transactionDate: new Date(2026, 3, 6),
        },
        {
          userId: user2.id,
          walletId: wallet2.id,
          type: 'EXPENSE',
          amount: 1111,
          description: 'Despesa User 2',
          expenseCategoryId: category2.id,
          transactionDate: new Date(2026, 3, 7),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user1.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary?year=2026&month=4',
      {
        method: 'GET',
      },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      month: 4,
      year: 2026,
      totalIncome: 1200,
      totalExpense: 400,
      result: 800,
    });
  });
});
