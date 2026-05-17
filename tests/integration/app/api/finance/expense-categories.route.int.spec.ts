import { GET } from '@/app/api/finance/expense-categories/route';
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

describe('GET /api/finance/expense-categories', () => {
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

  it('deve retornar categorias ativas do usuario autenticado', async () => {
    const user = await createTestUser({
      email: 'expense-categories@test.com',
    });
    const otherUser = await createTestUser({
      email: 'expense-categories-other@test.com',
    });

    await createTestExpenseCategory({
      userId: user.id,
      name: 'Combustivel',
      slug: 'combustivel',
    });
    await createTestExpenseCategory({
      userId: user.id,
      name: 'Inativa',
      slug: 'inativa',
      isActive: false,
    });
    await createTestExpenseCategory({
      userId: otherUser.id,
      name: 'Outro usuario',
      slug: 'outro-usuario',
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expense-categories',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      {
        id: expect.any(String),
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ]);
  });

  it('deve retornar 401 quando nao estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/finance/expense-categories',
      { method: 'GET' },
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
