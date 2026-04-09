import { GET } from '@/app/api/finance/history/route';
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

describe('GET /api/finance/history', () => {
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

  it('deve retornar o histórico do período informado sem filtro de type', async () => {
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
          description: 'Receita período',
          transactionDate: new Date(2026, 3, 2),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 300,
          description: 'Despesa período',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 3, 10),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 80,
          description: 'Despesa fora do período',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 4, 1),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(1000);
    expect(body.totalExpense).toBe(300);
    expect(body.balance).toBe(700);
    expect(body.entries).toHaveLength(2);

    expect(
      body.entries.every((entry: { description: string }) =>
        ['Receita período', 'Despesa período'].includes(entry.description),
      ),
    ).toBe(true);
  });

  it('deve retornar o histórico filtrado por type', async () => {
    const user = await createTestUser({
      email: 'history-type@test.com',
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
          description: 'Receita 1',
          transactionDate: new Date(2026, 3, 5),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 300,
          description: 'Receita 2',
          transactionDate: new Date(2026, 3, 8),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 200,
          description: 'Despesa 1',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 3, 9),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&type=INCOME',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(1000);
    expect(body.totalExpense).toBe(0);
    expect(body.balance).toBe(1000);
    expect(body.entries).toHaveLength(2);

    expect(
      body.entries.every((entry: { type: string }) => entry.type === 'INCOME'),
    ).toBe(true);
  });

  it('deve retornar 401 quando não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('deve retornar 400 quando faltar startDate', async () => {
    const user = await createTestUser({
      email: 'history-missing-start@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando faltar endDate', async () => {
    const user = await createTestUser({
      email: 'history-missing-end@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando startDate for maior que endDate', async () => {
    const user = await createTestUser({
      email: 'history-invalid-range@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-30&endDate=2026-04-01',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 quando type for inválido', async () => {
    const user = await createTestUser({
      email: 'history-invalid-type@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&type=INVALID',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('deve considerar apenas os lançamentos do usuário autenticado', async () => {
    const user1 = await createTestUser({
      email: 'history-user1@test.com',
    });
    const user2 = await createTestUser({
      email: 'history-user2@test.com',
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
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(1200);
    expect(body.totalExpense).toBe(400);
    expect(body.balance).toBe(800);
    expect(body.entries).toHaveLength(2);

    expect(
      body.entries.every((entry: { description: string }) =>
        ['Receita User 1', 'Despesa User 1'].includes(entry.description),
      ),
    ).toBe(true);
  });
});
