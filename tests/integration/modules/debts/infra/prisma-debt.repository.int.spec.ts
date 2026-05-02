import { randomUUID } from 'node:crypto';

import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { PrismaDebtRepository } from '@/modules/debts/infra/repositories/prisma-debt.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { makeTestDebtEntity } from 'tests/helpers/database/make-test-debt-entity';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';
import { createTestDebt } from 'tests/helpers/database/create-test-debt';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';

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

  it('deve criar uma dívida vinculando a wallet default internamente', async () => {
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

  it('deve buscar uma dívida por id', async () => {
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

  it('deve retornar null ao buscar uma dívida inexistente por id', async () => {
    const foundDebt = await repository.findById(randomUUID());

    expect(foundDebt).toBeNull();
  });

  it('deve listar dívidas por userId', async () => {
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

  it('deve listar apenas dívidas pendentes por userId', async () => {
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

  it('deve atualizar uma dívida pendente', async () => {
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

  it('deve atualizar uma dívida para paga', async () => {
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
    });

    const result = await repository.update(paidDebt);

    expect(result.id).toBe(persistedDebt.id);
    expect(result.status).toBe(DebtStatus.PAID);
    expect(result.paidAt?.toISOString()).toBe('2026-05-10T00:00:00.000Z');
    expect(result.paymentSource).toBe(DebtPaymentSource.BANK);
  });

  it('deve excluir uma dívida', async () => {
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

  it('deve lançar DefaultWalletNotFoundError ao criar dívida sem wallet default para o usuário', async () => {
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
});
