import { PATCH as PAY } from '@/app/api/debts/[id]/pay/route';
import { POST as UNDO } from '@/app/api/debts/[id]/undo-payment/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

async function cleanDatabase() {
  await prisma.transaction.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function pay(
  debtId: string,
  categoryId: string,
  paymentSource = DebtPaymentSource.BANK,
) {
  const response = await PAY(
    new NextRequest(`http://localhost:3000/api/debts/${debtId}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({
        paidAt: '2026-10-20',
        expenseCategoryId: categoryId,
        paymentSource,
      }),
    }),
    params(debtId),
  );

  expect(response.status).toBe(200);
}

function undo(debtId: string) {
  return UNDO(
    new NextRequest(`http://localhost:3000/api/debts/${debtId}/undo-payment`, {
      method: 'POST',
    }),
    params(debtId),
  );
}

async function walletBalances(walletId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });

  return {
    bank: Number(wallet?.bankBalance),
    cash: Number(wallet?.cashBalance),
    receivable: Number(wallet?.receivableBalance),
  };
}

async function seedUser() {
  const user = await createTestUser();
  const wallet = await createTestWallet({
    userId: user.id,
    bankBalance: 1000,
    cashBalance: 200,
    receivableBalance: 500,
  });
  const category = await createTestExpenseCategory({
    userId: user.id,
    name: 'Contas',
    slug: 'contas',
  });

  return { user, wallet, category };
}

describe('POST /api/debts/[id]/undo-payment', () => {
  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should undo a BANK payment end to end: pending, expense gone and bank balance back', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({ userId: user.id, walletId: wallet.id, amount: 150 });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id);

    const response = await undo(debt.id);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: debt.id,
      status: DebtStatus.PENDING,
      paidAt: null,
      paymentSource: null,
      paymentRecordedAt: null,
    });

    const row = await prisma.debt.findUnique({ where: { id: debt.id } });
    expect(row?.status).toBe(DebtStatus.PENDING);
    expect(row?.paymentRecordedAt).toBeNull();
    expect(await prisma.transaction.count({ where: { debtId: debt.id } })).toBe(0);
    expect(await walletBalances(wallet.id)).toEqual({ bank: 1000, cash: 200, receivable: 500 });
  });

  it('should undo a recurring payment and delete the pending occurrence it generated', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 90,
      type: DebtType.RECURRING,
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id, DebtPaymentSource.CASH);
    expect(await prisma.debt.count({ where: { userId: user.id } })).toBe(2);

    const response = await undo(debt.id);

    expect(response.status).toBe(200);
    expect(await prisma.debt.count({ where: { userId: user.id } })).toBe(1);
    expect(await walletBalances(wallet.id)).toEqual({ bank: 1000, cash: 200, receivable: 500 });
  });

  // The requests do not truly overlap here; the real race (both reading PAID
  // before either writes) is proven with a barrier in the use case integration test.
  it('should credit the wallet only once when the same undo is sent twice', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({ userId: user.id, walletId: wallet.id, amount: 300 });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id);

    const [first, second] = await Promise.all([undo(debt.id), undo(debt.id)]);

    expect([first.status, second.status].sort()).toEqual([200, 409]);
    expect(await walletBalances(wallet.id)).toEqual({ bank: 1000, cash: 200, receivable: 500 });
  });

  it('should roll everything back when a step fails (no default wallet)', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({ userId: user.id, walletId: wallet.id, amount: 150 });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id);
    await prisma.wallet.update({ where: { id: wallet.id }, data: { isDefault: false } });

    const response = await undo(debt.id);

    expect(response.status).toBeGreaterThanOrEqual(400);
    const row = await prisma.debt.findUnique({ where: { id: debt.id } });
    expect(row?.status).toBe(DebtStatus.PAID);
    expect(row?.paymentRecordedAt).not.toBeNull();
    expect(await prisma.transaction.count({ where: { debtId: debt.id } })).toBe(1);
  });

  it('should return 409 when the next occurrence is already paid', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 90,
      type: DebtType.RECURRING,
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id);
    const occurrence = await prisma.debt.findFirstOrThrow({
      where: { generatedFromDebtId: debt.id },
    });
    await pay(occurrence.id, category.id);

    const response = await undo(debt.id);

    expect(response.status).toBe(409);
    expect((await response.json()).message).toBe(
      'Desfaça primeiro o pagamento da ocorrência seguinte.',
    );
    expect((await prisma.debt.findUnique({ where: { id: debt.id } }))?.status).toBe(
      DebtStatus.PAID,
    );
  });

  it('should return 409 more than 24h after the payment was recorded', async () => {
    const { user, wallet, category } = await seedUser();
    const debt = await createTestDebt({ userId: user.id, walletId: wallet.id });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(debt.id, category.id);
    await prisma.debt.update({
      where: { id: debt.id },
      data: { paymentRecordedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
    });

    const response = await undo(debt.id);

    expect(response.status).toBe(409);
    expect((await response.json()).message).toBe('O prazo pra desfazer este pagamento acabou.');
  });

  it("should not undo another user's payment and change nothing", async () => {
    const owner = await seedUser();
    const intruder = await createTestUser();
    const debt = await createTestDebt({
      userId: owner.user.id,
      walletId: owner.wallet.id,
      amount: 150,
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(owner.user.id);
    await pay(debt.id, owner.category.id);
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(intruder.id);

    const response = await undo(debt.id);

    expect(response.status).toBe(404);
    expect((await prisma.debt.findUnique({ where: { id: debt.id } }))?.status).toBe(
      DebtStatus.PAID,
    );
    expect(await walletBalances(owner.wallet.id)).toEqual({
      bank: 850,
      cash: 200,
      receivable: 500,
    });
  });

  it('should handle a chain: undoing Z deletes A even after A had its own payment undone', async () => {
    const { user, wallet, category } = await seedUser();
    const z = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 50,
      type: DebtType.RECURRING,
    });
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);
    await pay(z.id, category.id);
    const a = await prisma.debt.findFirstOrThrow({ where: { generatedFromDebtId: z.id } });
    await pay(a.id, category.id);
    expect((await undo(a.id)).status).toBe(200);

    const response = await undo(z.id);

    expect(response.status).toBe(200);
    expect(await prisma.debt.findUnique({ where: { id: a.id } })).toBeNull();
    expect(await prisma.debt.count({ where: { userId: user.id } })).toBe(1);
    expect(await walletBalances(wallet.id)).toEqual({ bank: 1000, cash: 200, receivable: 500 });
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const response = await undo('550e8400-e29b-41d4-a716-446655440000');

    expect(response.status).toBe(401);
  });
});
