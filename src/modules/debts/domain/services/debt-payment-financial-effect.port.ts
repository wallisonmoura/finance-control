export interface RegisterDebtPaymentFinancialEffectInput {
  debtId: string;
  userId: string;
  amount: number;
  description: string;
  paymentDate: Date;
}

export interface DebtPaymentFinancialEffectPort {
  registerPayment(
    input: RegisterDebtPaymentFinancialEffectInput,
  ): Promise<void>;
}
