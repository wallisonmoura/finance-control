import { PUT } from '@/app/api/finance/income-goals/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
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

function putRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/finance/income-goals', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function storedGoal(userId: string) {
  const row = await prisma.incomeGoal.findUnique({ where: { userId } });

  return row && {
    revenueTarget: row.revenueTarget === null ? null : Number(row.revenueTarget),
    profitTarget: row.profitTarget === null ? null : Number(row.profitTarget),
  };
}

describe('PUT /api/finance/income-goals', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.incomeGoal.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.incomeGoal.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should set both goals and then clear one', async () => {
    const user = await createTestUser({ email: 'income-goals@test.com' });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const set = await PUT(putRequest({ revenueTarget: 6000, profitTarget: 2000.5 }));
    expect(set.status).toBe(200);
    await expect(set.json()).resolves.toEqual({ revenueTarget: 6000, profitTarget: 2000.5 });
    await expect(storedGoal(user.id)).resolves.toEqual({
      revenueTarget: 6000,
      profitTarget: 2000.5,
    });

    const cleared = await PUT(putRequest({ revenueTarget: 6000, profitTarget: null }));
    expect(cleared.status).toBe(200);
    await expect(storedGoal(user.id)).resolves.toEqual({ revenueTarget: 6000, profitTarget: null });
  });

  it('should only change the goals of the authenticated user', async () => {
    const owner = await createTestUser({ email: 'goal-owner@test.com' });
    const other = await createTestUser({ email: 'goal-other@test.com' });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(owner.id);
    await PUT(putRequest({ revenueTarget: 6000, profitTarget: null }));

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(other.id);
    await PUT(putRequest({ revenueTarget: 100, profitTarget: 50 }));

    await expect(storedGoal(owner.id)).resolves.toEqual({ revenueTarget: 6000, profitTarget: null });
    await expect(storedGoal(other.id)).resolves.toEqual({ revenueTarget: 100, profitTarget: 50 });
  });

  it.each([
    { revenueTarget: 0, profitTarget: null },
    { revenueTarget: -5, profitTarget: null },
    { revenueTarget: 10.123, profitTarget: null },
    { revenueTarget: 'abc', profitTarget: null },
    { revenueTarget: null },
  ])('should reject an invalid body %p', async (body) => {
    const user = await createTestUser({ email: 'invalid-goal@test.com' });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const response = await PUT(putRequest(body));

    expect(response.status).toBe(400);
    await expect(storedGoal(user.id)).resolves.toBeNull();
  });

  it('should require authentication', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const response = await PUT(putRequest({ revenueTarget: 6000, profitTarget: null }));

    expect(response.status).toBe(401);
  });
});
