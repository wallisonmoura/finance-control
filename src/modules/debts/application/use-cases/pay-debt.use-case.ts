import { DebtNotFoundError } from '../../domain/errors/debt-not-found.error';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtPaymentFinancialEffectPort } from '../../domain/services/debt-payment-financial-effect.port';
import { DebtOutput } from '../dto/debt.output';
import { PayDebtInput } from '../dto/pay-debt.input';

export class PayDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly debtPaymentFinancialEffectPort: DebtPaymentFinancialEffectPort,
  ) {}

  async execute(input: PayDebtInput): Promise<DebtOutput> {
    const debt = await this.debtRepository.findById(input.id);

    if (!debt || debt.userId !== input.userId) {
      throw new DebtNotFoundError();
    }

    const paymentDate = input.paymentDate ?? new Date();

    const paidDebt = debt.markAsPaid(paymentDate);

    const savedDebt = await this.debtRepository.update(paidDebt);

    await this.debtPaymentFinancialEffectPort.registerPayment({
      debtId: savedDebt.id,
      userId: savedDebt.userId,
      amount: savedDebt.amount,
      description: savedDebt.description,
      paymentDate,
    });

    return savedDebt.toJSON();
  }
}
