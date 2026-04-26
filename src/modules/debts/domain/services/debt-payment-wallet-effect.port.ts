import { DebtPaymentSource } from '../enums/debt-payment-source.enum';

export interface DebtPaymentWalletEffectPort {
  debit(input: {
    userId: string;
    amount: number;
    paymentSource: DebtPaymentSource;
  }): Promise<void>;
}
