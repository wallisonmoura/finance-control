import { randomUUID } from 'node:crypto';

import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { PrismaDebtRepository } from '@/modules/debts/infra/repositories/prisma-debt.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { makeTestDebtEntity } from '../../../../helpers/database/make-test-debt-entity';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';

describe('PrismaDebtRepository', () => {
  let repository: PrismaDebtRepository;

  beforeAll(async () => {
    repository = new PrismaDebtRepository();
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

  it('should create a debt linking the default wallet internally', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 500,
      receivableBalance: 300,
    });

    const debt = makeTestDebtEntity({
      userId: user.id,
      description: 'Aluguel',
      amount: 500,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
    });

    const createdDebt = await repository.create(debt);

    expect(createdDebt.id).toBe(debt.id);
    expect(createdDebt.userId).toBe(user.id);
    expect(createdDebt.description).toBe('Aluguel');
    expect(createdDebt.amount).toBe(500);
    expect(createdDebt.dueDate.toISOString()).toBe('2026-05-15T00:00:00.000Z');
    expect(createdDebt.type).toBe(DebtType.ONE_TIME);
    expect(createdDebt.status).toBe(DebtStatus.PENDING);
    expect(createdDebt.notes).toBeNull();
    expect(createdDebt.paidAt).toBeNull();
    expect(createdDebt.paymentSource).toBeNull();

    const persistedDebt = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(persistedDebt).not.toBeNull();
    expect(persistedDebt?.walletId).toBe(wallet.id);
  });

  it('should find a debt by id', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const persistedDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Internet',
      amount: 100,
      dueDate: new Date('2026-05-20T00:00:00.000Z'),
    });

    const foundDebt = await repository.findById(persistedDebt.id);

    expect(foundDebt).not.toBeNull();
    expect(foundDebt?.id).toBe(persistedDebt.id);
    expect(foundDebt?.userId).toBe(user.id);
    expect(foundDebt?.description).toBe('Internet');
    expect(foundDebt?.amount).toBe(100);
    expect(foundDebt?.status).toBe(DebtStatus.PENDING);
  });

  it('should return null when finding a non-existent debt by id', async () => {
    const foundDebt = await repository.findById(randomUUID());

    expect(foundDebt).toBeNull();
  });

  it('should list debts by userId', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const anotherUser = await createTestUser();

    const anotherWallet = await createTestWallet({
      userId: anotherUser.id,
    });

    const firstDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    const secondDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Internet',
      amount: 100,
      dueDate: new Date('2026-05-20T00:00:00.000Z'),
    });

    await createTestDebt({
      userId: anotherUser.id,
      walletId: anotherWallet.id,
      description: 'Dívida de outro usuário',
      amount: 200,
      dueDate: new Date('2026-05-20T00:00:00.000Z'),
    });

    const debts = await repository.findByUserId(user.id);

    expect(debts).toHaveLength(2);
    expect(debts.map((debt) => debt.id)).toEqual(
      expect.arrayContaining([firstDebt.id, secondDebt.id]),
    );
    expect(debts.every((debt) => debt.userId === user.id)).toBe(true);
  });

  it('should list only pending debts by userId', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const pendingDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel pendente',
      amount: 500,
      status: DebtStatus.PENDING,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Dívida paga',
      amount: 100,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-05-10T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
      dueDate: new Date('2026-05-20T00:00:00.000Z'),
    });

    const pendingDebts = await repository.findPendingByUserId(user.id);

    expect(pendingDebts).toHaveLength(1);
    expect(pendingDebts[0].id).toBe(pendingDebt.id);
    expect(pendingDebts[0].status).toBe(DebtStatus.PENDING);
    expect(pendingDebts[0].paidAt).toBeNull();
    expect(pendingDebts[0].paymentSource).toBeNull();
  });

  it('should update a pending debt', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const persistedDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      notes: 'Observação inicial',
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    const debt = await repository.findById(persistedDebt.id);

    expect(debt).not.toBeNull();

    const updatedDebt = debt!.update({
      description: 'Aluguel atualizado',
      amount: 550,
      dueDate: new Date('2026-05-16T00:00:00.000Z'),
      type: DebtType.RECURRING,
      notes: null,
    });

    const result = await repository.update(updatedDebt);

    expect(result.id).toBe(persistedDebt.id);
    expect(result.description).toBe('Aluguel atualizado');
    expect(result.amount).toBe(550);
    expect(result.dueDate.toISOString()).toBe('2026-05-16T00:00:00.000Z');
    expect(result.type).toBe(DebtType.RECURRING);
    expect(result.notes).toBeNull();
    expect(result.status).toBe(DebtStatus.PENDING);
  });

  it('should update a debt to paid', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const persistedDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Cartão',
      amount: 200,
      dueDate: new Date('2026-05-20T00:00:00.000Z'),
    });

    const debt = await repository.findById(persistedDebt.id);

    expect(debt).not.toBeNull();

    const paidDebt = debt!.markAsPaid({
      paidAt: new Date('2026-05-10T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
      paymentRecordedAt: new Date('2026-05-10T12:00:00.000Z'),
    });

    const result = await repository.update(paidDebt);

    expect(result.id).toBe(persistedDebt.id);
    expect(result.status).toBe(DebtStatus.PAID);
    expect(result.paidAt?.toISOString()).toBe('2026-05-10T00:00:00.000Z');
    expect(result.paymentSource).toBe(DebtPaymentSource.BANK);
  });

  it('should delete a debt', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
    });

    const persistedDebt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Dívida para excluir',
      amount: 150,
    });

    await repository.delete(persistedDebt.id);

    const foundDebt = await repository.findById(persistedDebt.id);

    expect(foundDebt).toBeNull();
  });

  // A debt read by one request and deleted by another (e.g. an undo removing
  // the generated occurrence) before this request writes it.
  describe('when the debt was deleted after being read', () => {
    async function readThenDeleteDebt() {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const persistedDebt = await createTestDebt({
        userId: user.id,
        walletId: wallet.id,
        description: 'Ocorrência apagada',
        amount: 150,
      });
      const debt = await repository.findById(persistedDebt.id);
      await prisma.debt.delete({ where: { id: persistedDebt.id } });

      return debt!;
    }

    it('should throw DebtNotFoundError on update', async () => {
      const debt = await readThenDeleteDebt();
      const paidDebt = debt.markAsPaid({
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        paymentSource: DebtPaymentSource.BANK,
        paymentRecordedAt: new Date(),
      });

      await expect(repository.update(paidDebt)).rejects.toBeInstanceOf(DebtNotFoundError);
    });

    it('should throw DebtNotFoundError on delete', async () => {
      const debt = await readThenDeleteDebt();

      await expect(repository.delete(debt.id)).rejects.toBeInstanceOf(DebtNotFoundError);
    });
  });

  it('should throw DefaultWalletNotFoundError when creating a debt without a default wallet for the user', async () => {
    const user = await createTestUser();

    const debt = makeTestDebtEntity({
      userId: user.id,
      description: 'Dívida sem wallet',
      amount: 100,
    });

    await expect(repository.create(debt)).rejects.toBeInstanceOf(
      DefaultWalletNotFoundError,
    );
  });

  describe('payment', () => {
    const payment = {
      paidAt: new Date('2026-10-20T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
      paymentRecordedAt: new Date('2026-10-21T12:00:00.000Z'),
    };

    it('should mark a debt as paid only while it is still pending', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const debt = await createTestDebt({ userId: user.id, walletId: wallet.id });

      const pending = await repository.findById(debt.id);
      const paid = pending!.markAsPaid(payment);

      expect(await repository.markAsPaid(paid)).toBe(true);
      expect(await repository.markAsPaid(paid)).toBe(false);

      const row = await prisma.debt.findUnique({ where: { id: debt.id } });
      expect(row?.status).toBe(DebtStatus.PAID);
      expect(row?.paymentSource).toBe(DebtPaymentSource.BANK);
      expect(row?.paymentRecordedAt?.toISOString()).toBe('2026-10-21T12:00:00.000Z');
    });

    it("should not mark another user's debt as paid", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const debt = await createTestDebt({ userId: user.id, walletId: wallet.id });

      const pending = await repository.findById(debt.id);
      const forged = makeTestDebtEntity({
        ...pending!.markAsPaid(payment).toJSON(),
        userId: otherUser.id,
      });

      expect(await repository.markAsPaid(forged)).toBe(false);
      const row = await prisma.debt.findUnique({ where: { id: debt.id } });
      expect(row?.status).toBe(DebtStatus.PENDING);
    });
  });

  describe('payment undo', () => {
    async function seedPaidDebt(userId: string, walletId: string) {
      return createTestDebt({
        userId,
        walletId,
        status: DebtStatus.PAID,
        type: DebtType.RECURRING,
        paymentRecordedAt: new Date('2026-10-21T12:00:00.000Z'),
      });
    }

    it('should undo a payment only while the debt is still paid', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const debt = await seedPaidDebt(user.id, wallet.id);

      const paid = await repository.findById(debt.id);
      const pending = paid!.markAsPending(new Date('2026-10-21T13:00:00.000Z'));

      expect(await repository.markPaymentUndone(pending)).toBe(true);
      expect(await repository.markPaymentUndone(pending)).toBe(false);

      const row = await prisma.debt.findUnique({ where: { id: debt.id } });
      expect(row?.status).toBe(DebtStatus.PENDING);
      expect(row?.paidAt).toBeNull();
      expect(row?.paymentSource).toBeNull();
      expect(row?.paymentRecordedAt).toBeNull();
    });

    it("should not undo the payment of another user's debt", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const debt = await seedPaidDebt(user.id, wallet.id);

      const paid = await repository.findById(debt.id);
      const forged = makeTestDebtEntity({
        ...paid!.markAsPending(new Date()).toJSON(),
        userId: otherUser.id,
      });

      expect(await repository.markPaymentUndone(forged)).toBe(false);
      expect((await prisma.debt.findUnique({ where: { id: debt.id } }))?.status).toBe(
        DebtStatus.PAID,
      );
    });

    it('should find and delete only the pending occurrence generated from a debt of the same user', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const origin = await seedPaidDebt(user.id, wallet.id);
      const occurrence = await createTestDebt({
        userId: user.id,
        walletId: wallet.id,
        type: DebtType.RECURRING,
        generatedFromDebtId: origin.id,
      });

      expect((await repository.findGeneratedFrom(origin.id, user.id))?.id).toBe(occurrence.id);
      expect(await repository.findGeneratedFrom(origin.id, otherUser.id)).toBeNull();
      expect(await repository.deletePendingGeneratedFrom(origin.id, otherUser.id)).toBe(0);
      expect(await repository.deletePendingGeneratedFrom(origin.id, user.id)).toBe(1);
      expect(await prisma.debt.findUnique({ where: { id: occurrence.id } })).toBeNull();
    });

    it('should not delete a generated occurrence that is already paid', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const origin = await seedPaidDebt(user.id, wallet.id);
      const occurrence = await createTestDebt({
        userId: user.id,
        walletId: wallet.id,
        type: DebtType.RECURRING,
        status: DebtStatus.PAID,
        generatedFromDebtId: origin.id,
      });

      expect(await repository.deletePendingGeneratedFrom(origin.id, user.id)).toBe(0);
      expect(await prisma.debt.findUnique({ where: { id: occurrence.id } })).not.toBeNull();
    });

    it('should refuse a second occurrence generated from the same debt', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const origin = await seedPaidDebt(user.id, wallet.id);
      await createTestDebt({ userId: user.id, walletId: wallet.id, generatedFromDebtId: origin.id });

      await expect(
        createTestDebt({ userId: user.id, walletId: wallet.id, generatedFromDebtId: origin.id }),
      ).rejects.toThrow();
    });

    it('should reject a pending debt with a payment time at the database level', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const pending = await createTestDebt({ userId: user.id, walletId: wallet.id });

      await expect(
        prisma.debt.update({ where: { id: pending.id }, data: { paymentRecordedAt: new Date() } }),
      ).rejects.toThrow();
    });
  });
});
