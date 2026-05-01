import { DELETE } from '@/app/api/debts/[id]/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';
import { createTestDebt } from 'tests/helpers/database/make-test-debt-entity';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

describe('DELETE /api/debts/[id]', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  it('deve excluir uma dívida pendente do usuário autenticado', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida pendente',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}`,
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    expect(response.status).toBe(204);

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(debtOnDatabase).toBeNull();
  });

  it('deve retornar 409 ao tentar excluir uma dívida paga', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida paga',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}`,
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toHaveProperty('message');

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(debtOnDatabase).not.toBeNull();
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 400 quando o id for inválido', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/id-invalido',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({
        id: 'id-invalido',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
  });

  it('deve retornar 404 quando a dívida não existir ou pertencer a outro usuário', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'DELETE',
      },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('message');
  });
});
