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

  public removeCalls: { debtId: string; userId: string }[] = [];
  public removeResult = 1;

  async removePayment(input: { debtId: string; userId: string }): Promise<number> {
    this.removeCalls.push(input);
    return this.removeResult;
  }
}
