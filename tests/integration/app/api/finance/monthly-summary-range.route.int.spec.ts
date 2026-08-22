import { GET } from '@/app/api/finance/monthly-summary/range/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';
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
jest.mock('@/shared/domain/date/business-date', () => ({
  getCurrentBusinessDateValue: jest.fn(),
}));

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;
const mockedGetCurrentBusinessDateValue =
  getCurrentBusinessDateValue as jest.Mock;

describe('GET /api/finance/monthly-summary/range', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

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

  it('should return one summary per month, oldest first, with empty months zeroed', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({ userId: user.id, isDefault: true });
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
          description: 'Receita julho',
          transactionDate: new Date(2026, 6, 5),
        },
        {
          userId: user.id,
          walletId: wallet.id,
          type: 'EXPENSE',
          amount: 300,
          description: 'Despesa julho',
          expenseCategoryId: category.id,
          transactionDate: new Date(2026, 6, 10),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary/range?months=3',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      { year: 2026, month: 6, totalIncome: 0, totalExpense: 0, result: 0 },
      { year: 2026, month: 7, totalIncome: 1000, totalExpense: 300, result: 700 },
      { year: 2026, month: 8, totalIncome: 0, totalExpense: 0, result: 0 },
    ]);
  });

  it('should default to 6 months when the query omits months', async () => {
    const user = await createTestUser();
    await createTestWallet({ userId: user.id, isDefault: true });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary/range',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(6);
  });

  it('should return 401 when the user is not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary/range?months=3',
      { method: 'GET' },
    );

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 when months is out of range', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary/range?months=25',
      { method: 'GET' },
    );

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("should only consider the authenticated user's entries", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const wallet1 = await createTestWallet({ userId: user1.id, isDefault: true });
    const wallet2 = await createTestWallet({ userId: user2.id, isDefault: true });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user1.id,
          walletId: wallet1.id,
          type: 'INCOME',
          amount: 1200,
          description: 'Receita User 1',
          transactionDate: new Date(2026, 7, 6),
        },
        {
          userId: user2.id,
          walletId: wallet2.id,
          type: 'INCOME',
          amount: 9999,
          description: 'Receita User 2',
          transactionDate: new Date(2026, 7, 6),
        },
      ],
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user1.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/monthly-summary/range?months=1',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      { year: 2026, month: 8, totalIncome: 1200, totalExpense: 0, result: 1200 },
    ]);
  });
});
