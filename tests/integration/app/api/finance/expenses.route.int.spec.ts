import { POST } from '@/app/api/finance/expenses/route';
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

describe('POST /api/finance/expenses', () => {
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

  it('should create an expense successfully for the authenticated user', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Combustível',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50,
          description: 'Abastecimento',
          date: '2026-04-01',
          categoryId: category.id,
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      amount: 50,
      description: 'Abastecimento',
      type: 'EXPENSE',
      categoryId: category.id,
    });

    const persisted = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        description: 'Abastecimento',
      },
    });

    expect(persisted).not.toBeNull();
    expect(Number(persisted?.amount)).toBe(50);
    expect(persisted?.expenseCategoryId).toBe(category.id);
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50,
          description: 'Despesa sem auth',
          date: '2026-04-01',
          categoryId: '11111111-1111-1111-1111-111111111111',
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid payload', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: -10,
          description: '',
          date: 'data-invalida',
          categoryId: '',
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 404 when the category does not exist', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 70,
          description: 'Despesa com categoria inexistente',
          date: '2026-04-01',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('should return 404 when the category belongs to another user', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      isDefault: true,
    });

    const otherUser = await createTestUser();
    await createTestWallet({
      userId: otherUser.id,
      isDefault: true,
    });

    const otherUserCategory = await createTestExpenseCategory({
      userId: otherUser.id,
      name: 'Categoria de outro usuário',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 80,
          description: 'Despesa com categoria inválida',
          date: '2026-04-01',
          categoryId: otherUserCategory.id,
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(404);
  });
});
