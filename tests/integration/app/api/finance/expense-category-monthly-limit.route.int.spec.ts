import { PUT } from '@/app/api/finance/expense-categories/[id]/monthly-limit/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';
import { createTestUser } from '../../../../helpers/database/create-test-user';

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

function putRequest(id: string, body: unknown) {
  return new NextRequest(
    `http://localhost:3000/api/finance/expense-categories/${id}/monthly-limit`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PUT /api/finance/expense-categories/:id/monthly-limit', () => {
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

  it('should set and clear the monthly limit of the user category', async () => {
    const user = await createTestUser({ email: 'goals@test.com' });
    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Lazer',
      slug: 'lazer',
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const set = await PUT(
      putRequest(category.id, { monthlyLimit: 300 }),
      context(category.id),
    );

    expect(set.status).toBe(200);
    await expect(set.json()).resolves.toEqual({
      id: category.id,
      name: 'Lazer',
      slug: 'lazer',
      monthlyLimit: 300,
    });

    const cleared = await PUT(
      putRequest(category.id, { monthlyLimit: null }),
      context(category.id),
    );

    expect(cleared.status).toBe(200);
    await expect(cleared.json()).resolves.toMatchObject({ monthlyLimit: null });
    const stored = await prisma.expenseCategory.findUnique({
      where: { id: category.id },
    });
    expect(stored?.monthlyLimit).toBeNull();
  });

  it('should not let a user change the goal of another user category', async () => {
    const owner = await createTestUser({ email: 'owner@test.com' });
    const intruder = await createTestUser({ email: 'intruder@test.com' });
    const category = await createTestExpenseCategory({
      userId: owner.id,
      name: 'Lazer',
      slug: 'lazer',
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(intruder.id);

    const response = await PUT(
      putRequest(category.id, { monthlyLimit: 300 }),
      context(category.id),
    );

    expect(response.status).toBe(404);
    const stored = await prisma.expenseCategory.findUnique({
      where: { id: category.id },
    });
    expect(stored?.monthlyLimit).toBeNull();
  });

  it.each([0, -5, 10.123, 'abc', undefined])(
    'should reject an invalid limit %p',
    async (monthlyLimit) => {
      const user = await createTestUser({ email: 'invalid@test.com' });
      const category = await createTestExpenseCategory({
        userId: user.id,
        name: 'Lazer',
        slug: 'lazer',
      });
      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const response = await PUT(
        putRequest(category.id, { monthlyLimit }),
        context(category.id),
      );

      expect(response.status).toBe(400);
    },
  );

  it('should refuse a goal on an inactive category', async () => {
    const user = await createTestUser({ email: 'inactive@test.com' });
    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Velha',
      slug: 'velha',
      isActive: false,
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const response = await PUT(
      putRequest(category.id, { monthlyLimit: 10 }),
      context(category.id),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Não é possível definir meta em uma categoria inativa.',
    });
  });

  it('should return 404 for a category that does not exist', async () => {
    const user = await createTestUser({ email: 'missing@test.com' });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    const id = '00000000-0000-4000-8000-000000000000';

    const response = await PUT(putRequest(id, { monthlyLimit: 10 }), context(id));

    expect(response.status).toBe(404);
  });

  it('should require authentication', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);
    const id = '00000000-0000-4000-8000-000000000000';

    const response = await PUT(putRequest(id, { monthlyLimit: 10 }), context(id));

    expect(response.status).toBe(401);
  });
});
