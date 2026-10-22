import { UndoDebtPaymentUseCase } from '@/modules/debts/application/use-cases/undo-debt-payment.use-case';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtNotPaidError } from '@/modules/debts/domain/errors/debt-not-paid.error';
import { DebtPaymentExpenseNotFoundError } from '@/modules/debts/domain/errors/debt-payment-expense-not-found.error';
import { DebtPaymentUndoExpiredError } from '@/modules/debts/domain/errors/debt-payment-undo-expired.error';
import { NextOccurrenceAlreadyPaidError } from '@/modules/debts/domain/errors/next-occurrence-already-paid.error';
import { UnauthorizedDebtAccessError } from '@/modules/debts/domain/errors/unauthorized-debt-access.error';
import { InMemoryDebtPaymentFinancialEffectPort } from './fakes/in-memory-debt-payment-financial-effect.port';
import { InMemoryDebtPaymentWalletEffectPort } from './fakes/in-memory-debt-payment-wallet-effect.port';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';

const NOW = new Date('2026-10-21T15:00:00.000Z');
const HOUR_MS = 60 * 60 * 1000;

function makePendingDebt(overrides: Partial<Parameters<typeof Debt.create>[0]> = {}) {
  return Debt.create({
    id: 'debt-1',
    userId: 'user-1',
    description: 'Internet',
    amount: 120,
    dueDate: new Date('2026-10-20'),
    type: DebtType.ONE_TIME,
    status: DebtStatus.PENDING,
    notes: null,
    paidAt: null,
    paymentSource: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
    ...overrides,
  });
}

function makePaidDebt(
  overrides: Partial<Parameters<typeof Debt.create>[0]> = {},
  paymentSource = DebtPaymentSource.CASH,
  recordedAt = new Date(NOW.getTime() - HOUR_MS),
) {
  return makePendingDebt(overrides).markAsPaid({
    paidAt: new Date('2026-10-19'),
    paymentSource,
    paymentRecordedAt: recordedAt,
  });
}

describe('UndoDebtPaymentUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let financial: InMemoryDebtPaymentFinancialEffectPort;
  let wallet: InMemoryDebtPaymentWalletEffectPort;
  let sut: UndoDebtPaymentUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    financial = new InMemoryDebtPaymentFinancialEffectPort();
    wallet = new InMemoryDebtPaymentWalletEffectPort();
    sut = new UndoDebtPaymentUseCase(debtRepository, financial, wallet, () => NOW);
  });

  it('should undo the payment: pending again, expense removed and the amount credited back', async () => {
    await debtRepository.create(makePaidDebt());

    const output = await sut.execute({ id: 'debt-1', userId: 'user-1' });

    expect(output.status).toBe(DebtStatus.PENDING);
    expect(output.paidAt).toBeNull();
    expect(output.paymentSource).toBeNull();
    expect(output.paymentRecordedAt).toBeNull();
    expect((await debtRepository.findById('debt-1'))?.status).toBe(DebtStatus.PENDING);
    expect(financial.removeCalls).toEqual([{ debtId: 'debt-1', userId: 'user-1' }]);
    expect(wallet.creditCalls).toEqual([
      { userId: 'user-1', amount: 120, paymentSource: DebtPaymentSource.CASH },
    ]);
  });

  it.each([DebtPaymentSource.BANK, DebtPaymentSource.CASH, DebtPaymentSource.RECEIVABLE])(
    'should credit the amount back to %s',
    async (paymentSource) => {
      await debtRepository.create(makePaidDebt({}, paymentSource));

      await sut.execute({ id: 'debt-1', userId: 'user-1' });

      expect(wallet.creditCalls[0].paymentSource).toBe(paymentSource);
    },
  );

  it('should throw DebtNotFoundError for a missing debt', async () => {
    await expect(sut.execute({ id: 'missing', userId: 'user-1' })).rejects.toThrow(
      DebtNotFoundError,
    );
  });

  it("should throw UnauthorizedDebtAccessError for another user's debt and change nothing", async () => {
    await debtRepository.create(makePaidDebt());

    await expect(sut.execute({ id: 'debt-1', userId: 'user-2' })).rejects.toThrow(
      UnauthorizedDebtAccessError,
    );
    expect((await debtRepository.findById('debt-1'))?.status).toBe(DebtStatus.PAID);
    expect(wallet.creditCalls).toHaveLength(0);
  });

  it('should throw DebtNotPaidError for a pending debt', async () => {
    await debtRepository.create(makePendingDebt());

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      DebtNotPaidError,
    );
  });

  it('should throw DebtPaymentUndoExpiredError 24h01 after the payment was recorded', async () => {
    await debtRepository.create(
      makePaidDebt({}, DebtPaymentSource.CASH, new Date(NOW.getTime() - 24 * HOUR_MS - 60 * 1000)),
    );

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      DebtPaymentUndoExpiredError,
    );
    expect(wallet.creditCalls).toHaveLength(0);
  });

  it('should throw DebtPaymentUndoExpiredError for a payment recorded before this feature', async () => {
    await debtRepository.create(
      makePendingDebt({
        status: DebtStatus.PAID,
        paidAt: new Date('2026-10-19'),
        paymentSource: DebtPaymentSource.BANK,
      }),
    );

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      DebtPaymentUndoExpiredError,
    );
  });

  it('should delete the pending occurrence the payment generated, even if it was edited', async () => {
    await debtRepository.create(makePaidDebt({ type: DebtType.RECURRING }));
    const occurrence = makePendingDebt({
      id: 'debt-2',
      type: DebtType.RECURRING,
      generatedFromDebtId: 'debt-1',
    }).update({ amount: 999 });
    await debtRepository.create(occurrence);

    await sut.execute({ id: 'debt-1', userId: 'user-1' });

    expect(await debtRepository.findById('debt-2')).toBeNull();
  });

  it('should throw NextOccurrenceAlreadyPaidError when the generated occurrence is paid', async () => {
    await debtRepository.create(makePaidDebt({ type: DebtType.RECURRING }));
    await debtRepository.create(
      makePaidDebt({ id: 'debt-2', type: DebtType.RECURRING, generatedFromDebtId: 'debt-1' }),
    );

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      NextOccurrenceAlreadyPaidError,
    );
    expect(wallet.creditCalls).toHaveLength(0);
    expect(financial.removeCalls).toHaveLength(0);
  });

  it('should leave other debts alone for one-time and installment debts', async () => {
    await debtRepository.create(makePaidDebt({ type: DebtType.INSTALLMENT }));
    await debtRepository.create(makePendingDebt({ id: 'debt-3', type: DebtType.INSTALLMENT }));

    await sut.execute({ id: 'debt-1', userId: 'user-1' });

    expect(await debtRepository.findById('debt-3')).not.toBeNull();
  });

  it('should throw DebtNotPaidError when the conditional update matches no row (concurrent undo)', async () => {
    await debtRepository.create(makePaidDebt());
    jest.spyOn(debtRepository, 'markPaymentUndone').mockResolvedValue(false);

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      DebtNotPaidError,
    );
    expect(financial.removeCalls).toHaveLength(0);
    expect(wallet.creditCalls).toHaveLength(0);
  });

  it('should throw DebtPaymentExpenseNotFoundError when no expense was removed', async () => {
    await debtRepository.create(makePaidDebt());
    financial.removeResult = 0;

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      DebtPaymentExpenseNotFoundError,
    );
    expect(wallet.creditCalls).toHaveLength(0);
  });

  it('should throw NextOccurrenceAlreadyPaidError when the occurrence got paid before the delete', async () => {
    await debtRepository.create(makePaidDebt({ type: DebtType.RECURRING }));
    await debtRepository.create(
      makePendingDebt({ id: 'debt-2', type: DebtType.RECURRING, generatedFromDebtId: 'debt-1' }),
    );
    jest.spyOn(debtRepository, 'deletePendingGeneratedFrom').mockResolvedValue(0);

    await expect(sut.execute({ id: 'debt-1', userId: 'user-1' })).rejects.toThrow(
      NextOccurrenceAlreadyPaidError,
    );
  });
});
