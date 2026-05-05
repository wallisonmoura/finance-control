import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { PrismaDebtPaymentWalletEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-wallet-effect.adapter';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
import { prisma } from '@/shared/infra/database/prisma/client';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';

describe('PrismaDebtPaymentWalletEffectAdapter', () => {
  let adapter: PrismaDebtPaymentWalletEffectAdapter;

  beforeAll(async () => {
    adapter = new PrismaDebtPaymentWalletEffectAdapter();
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('deve debitar bankBalance quando paymentSource for BANK', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    await adapter.debit({
      userId: user.id,
      amount: 300,
      paymentSource: DebtPaymentSource.BANK,
    });

    const updatedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(updatedWallet?.bankBalance.toNumber()).toBe(200);
    expect(updatedWallet?.cashBalance.toNumber()).toBe(100);
    expect(updatedWallet?.receivableBalance.toNumber()).toBe(200);
  });

  it('deve debitar cashBalance quando paymentSource for CASH', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    await adapter.debit({
      userId: user.id,
      amount: 80,
      paymentSource: DebtPaymentSource.CASH,
    });

    const updatedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(updatedWallet?.bankBalance.toNumber()).toBe(500);
    expect(updatedWallet?.cashBalance.toNumber()).toBe(20);
    expect(updatedWallet?.receivableBalance.toNumber()).toBe(200);
  });

  it('deve debitar receivableBalance quando paymentSource for RECEIVABLE', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    await adapter.debit({
      userId: user.id,
      amount: 150,
      paymentSource: DebtPaymentSource.RECEIVABLE,
    });

    const updatedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(updatedWallet?.bankBalance.toNumber()).toBe(500);
    expect(updatedWallet?.cashBalance.toNumber()).toBe(100);
    expect(updatedWallet?.receivableBalance.toNumber()).toBe(50);
  });

  it('deve lançar DefaultWalletNotFoundError quando não existir wallet default', async () => {
    const user = await createTestUser();

    await expect(
      adapter.debit({
        userId: user.id,
        amount: 100,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).rejects.toBeInstanceOf(DefaultWalletNotFoundError);
  });

  it('deve lançar InsufficientWalletBalanceError quando BANK não tiver saldo suficiente', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 100,
      cashBalance: 500,
      receivableBalance: 500,
    });

    await expect(
      adapter.debit({
        userId: user.id,
        amount: 300,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).rejects.toBeInstanceOf(InsufficientWalletBalanceError);
  });

  it('deve lançar InsufficientWalletBalanceError quando CASH não tiver saldo suficiente', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 50,
      receivableBalance: 500,
    });

    await expect(
      adapter.debit({
        userId: user.id,
        amount: 100,
        paymentSource: DebtPaymentSource.CASH,
      }),
    ).rejects.toBeInstanceOf(InsufficientWalletBalanceError);
  });

  it('deve lançar InsufficientWalletBalanceError quando RECEIVABLE não tiver saldo suficiente', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 500,
      receivableBalance: 80,
    });

    await expect(
      adapter.debit({
        userId: user.id,
        amount: 100,
        paymentSource: DebtPaymentSource.RECEIVABLE,
      }),
    ).rejects.toBeInstanceOf(InsufficientWalletBalanceError);
  });
});
