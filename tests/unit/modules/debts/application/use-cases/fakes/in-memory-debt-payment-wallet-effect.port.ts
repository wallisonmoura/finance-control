import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtPaymentWalletEffectPort } from '@/modules/debts/domain/services/debt-payment-wallet-effect.port';

type DebitCall = {
  userId: string;
  amount: number;
  paymentSource: DebtPaymentSource;
};

export class InMemoryDebtPaymentWalletEffectPort implements DebtPaymentWalletEffectPort {
  public calls: DebitCall[] = [];

  async debit(input: DebitCall): Promise<void> {
    this.calls.push(input);
  }
}
