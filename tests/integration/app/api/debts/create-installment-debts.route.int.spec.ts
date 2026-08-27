import { POST } from '@/app/api/debts/installments/route';
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

describe('POST /api/debts/installments', () => {
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

  it('should create one debt per installment for the authenticated user', async () => {
    const user = await createTestUser();
    await createTestWallet({ userId: user.id });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/installments',
      {
        method: 'POST',
        body: JSON.stringify({
          description: 'Cartão Letícia',
          amount: 1000,
          dueDate: '2026-08-29',
          installmentCount: 3,
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toHaveLength(3);
    expect(body.map((debt: { amount: number }) => debt.amount)).toEqual([
      333.33, 333.33, 333.34,
    ]);
    expect(
      body.every(
        (debt: { type: string }) => debt.type === DebtType.INSTALLMENT,
      ),
    ).toBe(true);
    expect(
      body.every(
        (debt: { status: string }) => debt.status === DebtStatus.PENDING,
      ),
    ).toBe(true);
    expect(body.map((debt: { notes: string }) => debt.notes)).toEqual([
      'Parcela 01/03',
      'Parcela 02/03',
      'Parcela 03/03',
    ]);
    expect(body.map((debt: { dueDate: string }) => debt.dueDate)).toEqual([
      '2026-08-29',
      '2026-09-29',
      '2026-10-29',
    ]);

    const debtsOnDatabase = await prisma.debt.findMany({
      where: { userId: user.id },
    });
    expect(debtsOnDatabase).toHaveLength(3);
  });

  it('should return 401 when the user is not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/installments',
      {
        method: 'POST',
        body: JSON.stringify({
          description: 'Cartão Letícia',
          amount: 1000,
          dueDate: '2026-08-29',
          installmentCount: 3,
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 when installmentCount is out of range', async () => {
    const user = await createTestUser();
    await createTestWallet({ userId: user.id });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/installments',
      {
        method: 'POST',
        body: JSON.stringify({
          description: 'Cartão Letícia',
          amount: 1000,
          dueDate: '2026-08-29',
          installmentCount: 15,
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
  });

  // Every create() call fails identically here (no wallet exists at all),
  // so this doesn't simulate a failure partway through a batch where some
  // installments already succeeded — it proves the weaker but still
  // meaningful guarantee that a failing transaction leaves zero rows
  // persisted, not a partial set.
  it('should not persist any installment when debt creation fails (no default wallet)', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/installments',
      {
        method: 'POST',
        body: JSON.stringify({
          description: 'Cartão Letícia',
          amount: 1000,
          dueDate: '2026-08-29',
          installmentCount: 3,
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(404);

    const debtsOnDatabase = await prisma.debt.findMany({
      where: { userId: user.id },
    });
    expect(debtsOnDatabase).toHaveLength(0);
  });

  it("should only consider the authenticated user's own debts", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    await createTestWallet({ userId: user1.id });
    await createTestWallet({ userId: user2.id });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user1.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/installments',
      {
        method: 'POST',
        body: JSON.stringify({
          description: 'Cartão Letícia',
          amount: 400,
          dueDate: '2026-08-29',
          installmentCount: 2,
        }),
      },
    );

    await POST(request);

    const user2Debts = await prisma.debt.findMany({
      where: { userId: user2.id },
    });
    expect(user2Debts).toHaveLength(0);
  });
});
