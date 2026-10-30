import { PUT } from '@/app/api/debts/[id]/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

describe('PUT /api/debts/[id]', () => {
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

  it('should update a pending debt of the authenticated user', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida original',
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
        method: 'PUT',
        body: JSON.stringify({
          amount: 175.5,
          description: 'Dívida atualizada',
          dueDate: '2026-05-12',
          type: DebtType.RECURRING,
          notes: 'Valor corrigido',
        }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);

    expect(body).toMatchObject({
      id: debt.id,
      userId: user.id,
      amount: 175.5,
      description: 'Dívida atualizada',
      type: DebtType.RECURRING,
      status: DebtStatus.PENDING,
      notes: 'Valor corrigido',
    });

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(debtOnDatabase).not.toBeNull();
    expect(Number(debtOnDatabase?.amount)).toBe(175.5);
    expect(debtOnDatabase?.description).toBe('Dívida atualizada');
    expect(debtOnDatabase?.type).toBe(DebtType.RECURRING);
    expect(debtOnDatabase?.notes).toBe('Valor corrigido');
  });

  // The edit form hides the type of an installment; the API must refuse the
  // change on its own, or an installment could become an endless recurring debt.
  it('should return 400 and keep the type when an installment is sent as recurring', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({ userId: user.id });
    const installment = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 65.15,
      description: 'Troca de óleo',
      dueDate: new Date('2026-11-18T00:00:00.000Z'),
      type: DebtType.INSTALLMENT,
      status: DebtStatus.PENDING,
      notes: 'Parcela 03/04',
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const response = await PUT(
      new NextRequest(`http://localhost:3000/api/debts/${installment.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount: 65.15,
          description: 'Troca de óleo',
          dueDate: '2026-11-18',
          type: DebtType.RECURRING,
          notes: 'Parcela 03/04',
        }),
      }),
      { params: Promise.resolve({ id: installment.id }) },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'Uma dívida parcelada não muda de tipo, e outra dívida não pode virar parcelada.',
    });
    const debtOnDatabase = await prisma.debt.findUnique({ where: { id: installment.id } });
    expect(debtOnDatabase?.type).toBe(DebtType.INSTALLMENT);
  });

  it('should return 401 when the user is not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PUT',
        body: JSON.stringify({
          amount: 175.5,
          description: 'Dívida atualizada',
          dueDate: '2026-05-12',
          type: DebtType.ONE_TIME,
          notes: 'Valor corrigido',
        }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('should return 400 when the id is invalid', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/id-invalido',
      {
        method: 'PUT',
        body: JSON.stringify({
          amount: 175.5,
          description: 'Dívida atualizada',
          dueDate: '2026-05-12',
          type: DebtType.ONE_TIME,
          notes: 'Valor corrigido',
        }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({
        id: 'id-invalido',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
  });

  it('should return 400 when the payload is invalid', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida original',
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
        method: 'PUT',
        body: JSON.stringify({
          amount: -10,
          description: '',
          dueDate: '2026-99-99',
          type: 'INVALID',
        }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
    expect(body.issues).toBeDefined();
  });

  it('should return 404 when the debt does not exist or belongs to another user', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PUT',
        body: JSON.stringify({
          amount: 175.5,
          description: 'Dívida inexistente',
          dueDate: '2026-05-12',
          type: DebtType.ONE_TIME,
          notes: 'Teste',
        }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('message');
  });
});
