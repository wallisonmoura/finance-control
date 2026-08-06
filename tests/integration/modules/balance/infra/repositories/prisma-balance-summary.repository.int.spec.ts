import { PrismaBalanceSummaryRepository } from '@/modules/balance/infra/repositories/prisma-balance-summary.repository';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../../helpers/database/create-test-wallet';
import { createTestDebt } from '../../../../../helpers/database/create-test-debt';

describe('PrismaBalanceSummaryRepository', () => {
  let sut: PrismaBalanceSummaryRepository;

  beforeAll(() => {
    sut = new PrismaBalanceSummaryRepository();
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

  it('deve retornar os dados-base da wallet e a soma das dívidas pendentes', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      dueDate: new Date('2026-05-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Internet',
      amount: 100,
      dueDate: new Date('2026-05-12'),
      type: DebtType.RECURRING,
      status: DebtStatus.PENDING,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Dívida paga',
      amount: 250,
      dueDate: new Date('2026-05-01'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-05-02'),
      paymentSource: DebtPaymentSource.BANK,
    });

    const output = await sut.findByUserId(user.id);

    expect(output).toEqual({
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      pendingDebts: 600,
    });
  });

  it('deve retornar pendingDebts zero quando o usuário não possuir dívidas pendentes', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 700,
      cashBalance: 100,
      receivableBalance: 50,
    });

    const output = await sut.findByUserId(user.id);

    expect(output).toEqual({
      bankBalance: 700,
      cashBalance: 100,
      receivableBalance: 50,
      pendingDebts: 0,
    });
  });

  it('deve retornar null quando o usuário não possuir wallet default', async () => {
    const user = await createTestUser();

    const output = await sut.findByUserId(user.id);

    expect(output).toBeNull();
  });

  it('não deve considerar dívidas pendentes de outro usuário', async () => {
    const user = await createTestUser();

    const anotherUser = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 100,
      cashBalance: 100,
      receivableBalance: 100,
    });

    const anotherWallet = await createTestWallet({
      userId: anotherUser.id,
      bankBalance: 999,
      cashBalance: 999,
      receivableBalance: 999,
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Minha dívida',
      amount: 50,
      dueDate: new Date('2026-05-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
    });

    await createTestDebt({
      userId: anotherUser.id,
      walletId: anotherWallet.id,
      description: 'Dívida de outro usuário',
      amount: 900,
      dueDate: new Date('2026-05-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
    });

    const output = await sut.findByUserId(user.id);

    expect(output).toEqual({
      bankBalance: 100,
      cashBalance: 100,
      receivableBalance: 100,
      pendingDebts: 50,
    });
  });
});
