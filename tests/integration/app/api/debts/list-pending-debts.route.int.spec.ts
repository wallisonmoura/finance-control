import { GET } from '@/app/api/debts/pending/route';
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

describe('GET /api/debts/pending', () => {
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

  it('deve listar apenas as dívidas pendentes do usuário autenticado', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    await createTestDebt({
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

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 300,
      description: 'Dívida paga',
      dueDate: new Date('2026-05-11T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts/pending', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);

    expect(body[0]).toMatchObject({
      userId: user.id,
      description: 'Dívida pendente',
      status: DebtStatus.PENDING,
      paidAt: null,
      paymentSource: null,
    });
  });

  it('deve retornar lista vazia quando o usuário não possuir dívidas pendentes', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 300,
      description: 'Dívida paga',
      dueDate: new Date('2026-05-11T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts/pending', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/debts/pending', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });
});
