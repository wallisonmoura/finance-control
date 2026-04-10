import {
  DebtPaymentFinancialEffectPort,
  RegisterDebtPaymentFinancialEffectInput,
} from '@/modules/debts/domain/services/debt-payment-financial-effect.port';

export class InMemoryDebtPaymentFinancialEffectPort implements DebtPaymentFinancialEffectPort {
  public calls: RegisterDebtPaymentFinancialEffectInput[] = [];

  async registerPayment(
    input: RegisterDebtPaymentFinancialEffectInput,
  ): Promise<void> {
    this.calls.push(input);
  }
}
