import { isAfterBusinessToday } from '@/shared/domain/date/business-date';
import { FutureDateNotAllowedError } from '@/shared/domain/errors/future-date-not-allowed.error';
import { DebtType } from '../../domain/enums/debt-type.enum';
import { DebtAlreadyPaidError } from '../../domain/errors/debt-already-paid.error';
import { DebtNotFoundError } from '../../domain/errors/debt-not-found.error';
import { UnauthorizedDebtAccessError } from '../../domain/errors/unauthorized-debt-access.error';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { buildNextRecurringDebt } from '../../domain/services/build-next-recurring-debt';
import { DebtPaymentFinancialEffectPort } from '../../domain/services/debt-payment-financial-effect.port';
import { DebtPaymentWalletEffectPort } from '../../domain/services/debt-payment-wallet-effect.port';
import { DebtOutput } from '../dtos/debt.output';
import { PayDebtInput } from '../dtos/pay-debt.input';

export class PayDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly debtPaymentFinancialEffectPort: DebtPaymentFinancialEffectPort,
    private readonly debtPaymentWalletEffectPort: DebtPaymentWalletEffectPort,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: PayDebtInput): Promise<DebtOutput> {
    const now = this.now();
    const debt = await this.debtRepository.findById(input.id);

    if (!debt) {
      throw new DebtNotFoundError();
    }

    if (debt.userId !== input.userId) {
      throw new UnauthorizedDebtAccessError();
    }

    if (isAfterBusinessToday(input.paidAt, now)) {
      throw new FutureDateNotAllowedError();
    }

    const paidDebt = debt.markAsPaid({
      paidAt: input.paidAt,
      paymentSource: input.paymentSource,
      paymentRecordedAt: now,
    });

    // No row updated: paid in another tab after the read above, or deleted
    // there (e.g. an undo removing this generated occurrence).
    if (!(await this.debtRepository.markAsPaid(paidDebt))) {
      if (!(await this.debtRepository.findById(debt.id))) {
        throw new DebtNotFoundError();
      }

      throw new DebtAlreadyPaidError();
    }

    await this.debtPaymentFinancialEffectPort.registerPayment({
      debtId: paidDebt.id,
      userId: paidDebt.userId,
      amount: paidDebt.amount,
      description: paidDebt.description,
      paidAt: input.paidAt,
      expenseCategoryId: input.expenseCategoryId,
    });

    await this.debtPaymentWalletEffectPort.debit({
      userId: paidDebt.userId,
      amount: paidDebt.amount,
      paymentSource: input.paymentSource,
    });

    if (paidDebt.type === DebtType.RECURRING) {
      const nextDebt = buildNextRecurringDebt(paidDebt, now);

      await this.debtRepository.create(nextDebt);
    }

    return paidDebt.toJSON();
  }
}
