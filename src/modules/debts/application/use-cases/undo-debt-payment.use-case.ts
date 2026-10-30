import { DebtNotFoundError } from '../../domain/errors/debt-not-found.error';
import { DebtNotPaidError } from '../../domain/errors/debt-not-paid.error';
import { DebtPaymentExpenseNotFoundError } from '../../domain/errors/debt-payment-expense-not-found.error';
import { DebtPaymentUndoExpiredError } from '../../domain/errors/debt-payment-undo-expired.error';
import { NextOccurrenceAlreadyPaidError } from '../../domain/errors/next-occurrence-already-paid.error';
import { UnauthorizedDebtAccessError } from '../../domain/errors/unauthorized-debt-access.error';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtPaymentFinancialEffectPort } from '../../domain/services/debt-payment-financial-effect.port';
import { DebtPaymentWalletEffectPort } from '../../domain/services/debt-payment-wallet-effect.port';
import { DebtOutput } from '../dtos/debt.output';
import { UndoDebtPaymentInput } from '../dtos/undo-debt-payment.input';

// Reverts every effect of PayDebtUseCase within 24h of the payment. Runs in one
// transaction (see make-undo-debt-payment-use-case.ts); the conditional writes
// make a second, concurrent undo fail instead of crediting the wallet twice.
export class UndoDebtPaymentUseCase {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly debtPaymentFinancialEffectPort: DebtPaymentFinancialEffectPort,
    private readonly debtPaymentWalletEffectPort: DebtPaymentWalletEffectPort,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: UndoDebtPaymentInput): Promise<DebtOutput> {
    const now = this.now();
    const debt = await this.debtRepository.findById(input.id);

    if (!debt) {
      throw new DebtNotFoundError();
    }

    if (debt.userId !== input.userId) {
      throw new UnauthorizedDebtAccessError();
    }

    if (!debt.isPaid()) {
      throw new DebtNotPaidError();
    }

    if (!debt.canUndoPayment(now)) {
      throw new DebtPaymentUndoExpiredError();
    }

    const nextOccurrence = await this.debtRepository.findGeneratedFrom(
      debt.id,
      debt.userId,
    );

    if (nextOccurrence?.isPaid()) {
      throw new NextOccurrenceAlreadyPaidError();
    }

    const paymentSource = debt.paymentSource!;
    const pendingDebt = debt.markAsPending(now);

    if (!(await this.debtRepository.markPaymentUndone(pendingDebt))) {
      throw new DebtNotPaidError();
    }

    const removedExpenses = await this.debtPaymentFinancialEffectPort.removePayment({
      debtId: debt.id,
      userId: debt.userId,
    });

    if (removedExpenses !== 1) {
      throw new DebtPaymentExpenseNotFoundError();
    }

    await this.debtPaymentWalletEffectPort.credit({
      userId: debt.userId,
      amount: debt.amount,
      paymentSource,
    });

    if (nextOccurrence) {
      const deleted = await this.debtRepository.deletePendingGeneratedFrom(
        debt.id,
        debt.userId,
      );

      // Nothing deleted: either paid in another tab between the read above and
      // this delete (block), or deleted there (already gone, nothing to undo).
      if (
        deleted === 0 &&
        (await this.debtRepository.findGeneratedFrom(debt.id, debt.userId))
      ) {
        throw new NextOccurrenceAlreadyPaidError();
      }
    }

    return pendingDebt.toJSON();
  }
}
