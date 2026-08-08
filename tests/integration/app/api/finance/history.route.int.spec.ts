import { GET } from '@/app/api/finance/history/route';
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

describe('GET /api/finance/history', () => {
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

  it('should return the history for the given period without a type filter', async () => {
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

    expect(
      body.entries.every((entry: { date: string }) =>
        /^\d{4}-\d{2}-\d{2}$/.test(entry.date),
      ),
    ).toBe(true);
  });

  it('should include entries made on the given endDate itself', async () => {
    const user = await createTestUser({
      email: 'history-inclusive-end-date@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 360,
          description: 'Receita no fim do período',
          transactionDate: new Date(2026, 4, 16, 15, 30),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 100,
          description: 'Receita fora do período',
          transactionDate: new Date(2026, 4, 17),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-05-01&endDate=2026-05-16',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(360);
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].description).toBe('Receita no fim do período');
  });

  it('should return the history filtered by type', async () => {
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

  it('should filter the history by category when categoryId is informed', async () => {
    const user = await createTestUser({
      email: 'history-category-filter@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });
    const categoryA = await createTestExpenseCategory({
      userId: user.id,
      name: 'Categoria A',
    });
    const categoryB = await createTestExpenseCategory({
      userId: user.id,
      name: 'Categoria B',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 150,
          description: 'Despesa categoria A',
          expenseCategoryId: categoryA.id,
          transactionDate: new Date(2026, 3, 10),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 90,
          description: 'Despesa categoria B',
          expenseCategoryId: categoryB.id,
          transactionDate: new Date(2026, 3, 11),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&type=EXPENSE&categoryId=${categoryA.id}`,
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].categoryId).toBe(categoryA.id);
    expect(body.totalExpense).toBe(150);
  });

  it('should return empty when categoryId has no entries in the period', async () => {
    const user = await createTestUser({
      email: 'history-category-empty@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });
    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Categoria sem lançamentos',
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 50,
        description: 'Despesa de outra categoria',
        expenseCategoryId: category.id,
        transactionDate: new Date(2026, 3, 10),
      },
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&type=EXPENSE&categoryId=99999999-9999-4999-8999-999999999999',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(0);
  });

  it('should return empty when categoryId belongs to another user', async () => {
    const user = await createTestUser({
      email: 'history-category-owner@test.com',
    });
    const otherUser = await createTestUser({
      email: 'history-category-other-owner@test.com',
    });

    const wallet = await createTestWallet({
      userId: user.id,
      name: 'Carteira do dono',
      isDefault: true,
    });
    const otherWallet = await createTestWallet({
      userId: otherUser.id,
      name: 'Carteira do outro',
      isDefault: true,
    });

    const otherCategory = await createTestExpenseCategory({
      userId: otherUser.id,
      name: 'Categoria do outro usuário',
    });
    const ownCategory = await createTestExpenseCategory({
      userId: user.id,
      name: 'Categoria do dono',
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 120,
          description: 'Despesa do dono',
          expenseCategoryId: ownCategory.id,
          transactionDate: new Date(2026, 3, 10),
        },
        {
          userId: otherUser.id,
          walletId: otherWallet.id,
          type: 'EXPENSE',
          amount: 999,
          description: 'Despesa do outro usuário',
          expenseCategoryId: otherCategory.id,
          transactionDate: new Date(2026, 3, 10),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&type=EXPENSE&categoryId=${otherCategory.id}`,
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(0);
    expect(body.totalExpense).toBe(0);
  });

  it('should return 400 when categoryId is invalid', async () => {
    const user = await createTestUser({
      email: 'history-category-invalid@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30&categoryId=not-a-uuid',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 400 when startDate is missing', async () => {
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

  it('should return 400 when endDate is missing', async () => {
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

  it('should return 400 when startDate is greater than endDate', async () => {
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

  it('should return 400 when type is invalid', async () => {
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

  it("should consider only the authenticated user's entries", async () => {
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
