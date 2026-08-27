import { DebtType } from '../../domain/enums/debt-type.enum';
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
  ) {}

  async execute(input: PayDebtInput): Promise<DebtOutput> {
    const debt = await this.debtRepository.findById(input.id);

    if (!debt) {
      throw new DebtNotFoundError();
    }

    if (debt.userId !== input.userId) {
      throw new UnauthorizedDebtAccessError();
    }

    const paidDebt = debt.markAsPaid({
      paidAt: input.paidAt,
      paymentSource: input.paymentSource,
    });

    const savedDebt = await this.debtRepository.update(paidDebt);

    await this.debtPaymentFinancialEffectPort.registerPayment({
      debtId: savedDebt.id,
      userId: savedDebt.userId,
      amount: savedDebt.amount,
      description: savedDebt.description,
      paidAt: input.paidAt,
      expenseCategoryId: input.expenseCategoryId,
    });

    await this.debtPaymentWalletEffectPort.debit({
      userId: savedDebt.userId,
      amount: savedDebt.amount,
      paymentSource: input.paymentSource,
    });

    if (savedDebt.type === DebtType.RECURRING) {
      const nextDebt = buildNextRecurringDebt(savedDebt, new Date());

      await this.debtRepository.create(nextDebt);
    }

    return savedDebt.toJSON();
  }
}
