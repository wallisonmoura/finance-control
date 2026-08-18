import { GET } from '@/app/api/finance/history/full/route';
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

describe('GET /api/finance/history/full', () => {
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

  it('should return every entry in the period, not just the first 20, regardless of transaction count', async () => {
    const user = await createTestUser({
      email: 'history-full-no-truncation@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    await prisma.transaction.createMany({
      data: Array.from({ length: 130 }, (_, index) => ({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME' as const,
        amount: 10,
        description: `Receita ${index + 1}`,
        transactionDate: new Date(2026, 3, (index % 28) + 1),
      })),
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(130);
    expect(body.totalIncome).toBe(1300);
  });

  it('should ignore page and pageSize when present in the query string', async () => {
    const user = await createTestUser({
      email: 'history-full-ignores-pagination@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    await prisma.transaction.createMany({
      data: Array.from({ length: 25 }, (_, index) => ({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME' as const,
        amount: 10,
        description: `Receita ${index + 1}`,
        transactionDate: new Date(2026, 3, index + 1),
      })),
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30&page=2&pageSize=5',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(25);
  });

  it('should return the history filtered by type', async () => {
    const user = await createTestUser({
      email: 'history-full-type@test.com',
    });
    const wallet = await createTestWallet({
      userId: user.id,
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
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30&type=INCOME',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(700);
    expect(body.totalExpense).toBe(0);
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].type).toBe('INCOME');
  });

  it('should filter the history by category when categoryId is informed', async () => {
    const user = await createTestUser({
      email: 'history-full-category-filter@test.com',
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
      `http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30&type=EXPENSE&categoryId=${categoryA.id}`,
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].categoryId).toBe(categoryA.id);
    expect(body.totalExpense).toBe(150);
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 400 when startDate is missing', async () => {
    const user = await createTestUser({
      email: 'history-full-missing-start@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when endDate is missing', async () => {
    const user = await createTestUser({
      email: 'history-full-missing-end@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when startDate is greater than endDate', async () => {
    const user = await createTestUser({
      email: 'history-full-invalid-range@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-30&endDate=2026-04-01',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when categoryId is invalid', async () => {
    const user = await createTestUser({
      email: 'history-full-invalid-category@test.com',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30&categoryId=not-a-uuid',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it("should consider only the authenticated user's entries", async () => {
    const user1 = await createTestUser({
      email: 'history-full-user1@test.com',
    });
    const user2 = await createTestUser({
      email: 'history-full-user2@test.com',
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
      'http://localhost:3000/api/finance/history/full?startDate=2026-04-01&endDate=2026-04-30',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalIncome).toBe(1200);
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].description).toBe('Receita User 1');
  });
});
