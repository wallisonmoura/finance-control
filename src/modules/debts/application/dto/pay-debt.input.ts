import { DebtPaymentSource } from '../../domain/enums/debt-payment-source.enum';

export interface PayDebtInput {
  userId: string;
  id: string;
  paidAt: Date;
  expenseCategoryId: string;
  paymentSource: DebtPaymentSource;
}
