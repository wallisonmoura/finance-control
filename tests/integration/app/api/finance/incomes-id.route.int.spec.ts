import { DELETE, PUT } from '@/app/api/finance/incomes/[id]/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestFinancialEntry } from '../../../../helpers/database/create-test-financial-entry';

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

describe('PUT/DELETE /api/finance/incomes/[id]', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.transaction.deleteMany();
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

  describe('PUT /api/finance/incomes/[id]', () => {
    it('deve atualizar uma income com sucesso', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 100,
        description: 'Receita original',
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/incomes/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 180,
            description: 'Receita atualizada',
            date: '2026-04-02',
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        amount: 180,
        description: 'Receita atualizada',
        type: 'INCOME',
      });

      const updated = await prisma.transaction.findUnique({
        where: {
          id: entry.id,
        },
      });

      expect(updated).not.toBeNull();
      expect(Number(updated?.amount)).toBe(180);
      expect(updated?.description).toBe('Receita atualizada');
    });

    it('deve retornar 401 quando não estiver autenticado', async () => {
      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/incomes/some-id',
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 180,
            description: 'Receita atualizada',
            date: '2026-04-02',
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

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/incomes/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 0,
            description: '',
            date: 'data-invalida',
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar 404 quando a income não existir', async () => {
      const user = await createTestUser();

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/incomes/550e8400-e29b-41d4-a716-446655440000',
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 180,
            description: 'Receita atualizada',
            date: '2026-04-02',
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

    it('deve retornar 404 quando a income pertencer a outro usuário', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();

      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      const entry = await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'INCOME',
        amount: 120,
        description: 'Receita de outro usuário',
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/incomes/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            amount: 300,
            description: 'Tentativa de atualização indevida',
            date: '2026-04-02',
          }),
        },
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: entry.id }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/finance/incomes/[id]', () => {
    it('deve excluir uma income com sucesso', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const entry = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/incomes/${entry.id}`,
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
        'http://localhost:3000/api/finance/incomes/some-id',
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 quando a income não existir', async () => {
      const user = await createTestUser();

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        'http://localhost:3000/api/finance/incomes/550e8400-e29b-41d4-a716-446655440000',
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

    it('deve retornar 404 quando a income pertencer a outro usuário', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();

      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      const entry = await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'INCOME',
      });

      mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

      const request = new NextRequest(
        `http://localhost:3000/api/finance/incomes/${entry.id}`,
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
