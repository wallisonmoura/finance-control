import { DELETE, PUT } from '@/app/api/finance/expenses/[id]/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestExpenseCategory } from 'tests/helpers/database/create-test-expense-category';
import { createTestFinancialEntry } from 'tests/helpers/database/create-test-financial-entry';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';

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

describe('PUT/DELETE /api/finance/expenses/[id]', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.transaction.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });
  describe('PUT /api/finance/expenses/[id]', () => {
    it('deve atualizar uma expense com sucesso', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const category = await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustível',
      });

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 50,
        description: 'Despesa original',
        categoryId: category.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/expenses/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 90,
            description: 'Despesa atualizada',
            date: '2026-04-02',
            categoryId: category.id,
          }),
        },
      );
      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        amount: 90,
        description: 'Despesa atualizada',
        type: 'EXPENSE',
        categoryId: category.id,
      });

      const updated = await prisma.transaction.findUnique({
        where: {
          id: entry.id,
        },
      });

      expect(updated).not.toBeNull();
      expect(Number(updated?.amount)).toBe(90);
      expect(updated?.description).toBe('Despesa atualizada');
      expect(updated?.expenseCategoryId).toBe(category.id);
    });

    it('deve retornar 401 quando não estiver autenticado', async () => {
      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/expenses/some-id',
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 90,
            description: 'Despesa atualizada',
            date: '2026-04-02',
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar 400 para payload inválido', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const category = await createTestExpenseCategory({
        userId: user.id,
      });

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        categoryId: category.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/expenses/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 0,
            description: '',
            date: 'data-invalida',
            categoryId: 'invalido',
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar 404 quando a expense não existir', async () => {
      const user = await createTestUser();
      const category = await createTestExpenseCategory({
        userId: user.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/expenses/550e8400-e29b-41d4-a716-446655440000',
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 90,
            description: 'Despesa atualizada',
            date: '2026-04-02',
            categoryId: category.id,
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({
          id: '550e8400-e29b-41d4-a716-446655440000',
        }),
      });

      expect(response.status).toBe(404);
    });

    it('deve retornar 404 quando a expense pertencer a outro usuário', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();

      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      const otherCategory = await createTestExpenseCategory({
        userId: otherUser.id,
      });

      const entry = await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'EXPENSE',
        categoryId: otherCategory.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/expenses/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 90,
            description: 'Tentativa indevida',
            date: '2026-04-02',
            categoryId: otherCategory.id,
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/finance/expenses/[id]', () => {
    it('deve excluir uma expense com sucesso', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const category = await createTestExpenseCategory({
        userId: user.id,
      });

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        categoryId: category.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/expenses/${entry.id}`,
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(204);

      const deleted = await prisma.transaction.findUnique({
        where: {
          id: entry.id,
        },
      });

      expect(deleted).toBeNull();
    });

    it('deve retornar 401 quando não estiver autenticado', async () => {
      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/expenses/some-id',
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 quando a expense não existir', async () => {
      const user = await createTestUser();

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/expenses/550e8400-e29b-41d4-a716-446655440000',
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({
          id: '550e8400-e29b-41d4-a716-446655440000',
        }),
      });

      expect(response.status).toBe(404);
    });

    it('deve retornar 404 quando a expense pertencer a outro usuário', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();

      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      const otherCategory = await createTestExpenseCategory({
        userId: otherUser.id,
      });

      const entry = await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'EXPENSE',
        categoryId: otherCategory.id,
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/expenses/${entry.id}`,
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(404);
    });
  });
});
