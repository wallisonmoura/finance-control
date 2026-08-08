import { GET } from '@/app/api/debts/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
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

describe('GET /api/debts', () => {
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

  it('should list only the authenticated user debts', async () => {
    const user = await createTestUser();
    const otherUser = await createTestUser({
      email: 'other-user@test.com',
    });

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const otherWallet = await createTestWallet({
      userId: otherUser.id,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida do usuário autenticado',
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
      description: 'Dívida paga do usuário autenticado',
      dueDate: new Date('2026-05-11T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    });

    await createTestDebt({
      userId: otherUser.id,
      walletId: otherWallet.id,
      amount: 999,
      description: 'Dívida de outro usuário',
      dueDate: new Date('2026-05-12T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: user.id,
          description: 'Dívida do usuário autenticado',
          status: DebtStatus.PENDING,
        }),
        expect.objectContaining({
          userId: user.id,
          description: 'Dívida paga do usuário autenticado',
          status: DebtStatus.PAID,
          paymentSource: DebtPaymentSource.BANK,
        }),
      ]),
    );

    expect(body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'Dívida de outro usuário',
        }),
      ]),
    );
  });

  it('should return an empty list when the user has no debts', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it('should return 401 when the user is not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/debts', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });
});
