import { POST } from '@/app/api/debts/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

describe('POST /api/debts', () => {
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

  it('deve criar uma dívida para o usuário autenticado', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 500,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'POST',
      body: JSON.stringify({
        amount: 150.75,
        description: 'Parcela do cartão',
        dueDate: '2026-05-10',
        type: DebtType.ONE_TIME,
        notes: 'Teste de integração',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      userId: user.id,
      amount: 150.75,
      description: 'Parcela do cartão',
      status: DebtStatus.PENDING,
      type: DebtType.ONE_TIME,
      notes: 'Teste de integração',
      paidAt: null,
      paymentSource: null,
    });

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: body.id,
      },
    });

    expect(debtOnDatabase).not.toBeNull();
    expect(debtOnDatabase?.userId).toBe(user.id);
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'POST',
      body: JSON.stringify({
        amount: 150.75,
        description: 'Parcela do cartão',
        dueDate: '2026-05-10',
        type: DebtType.ONE_TIME,
        notes: 'Teste de integração',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 400 quando o payload for inválido', async () => {
    const user = await createTestUser();
    await createTestWallet({
      userId: user.id,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'POST',
      body: JSON.stringify({
        amount: -10,
        description: '',
        dueDate: '2026-99-99',
        type: 'INVALID',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
    expect(body.issues).toBeDefined();
  });

  it('deve retornar 400 quando o payload de cadastro for inválido', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'POST',
      body: JSON.stringify({
        description: '',
        amount: -1,
        dueDate: 'invalid-date',
        type: 'INVALID',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('message');
  });
});
