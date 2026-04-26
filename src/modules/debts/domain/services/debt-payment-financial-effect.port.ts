export interface RegisterDebtPaymentFinancialEffectInput {
  debtId: string;
  userId: string;
  amount: number;
  description: string;
  paidAt: Date;
  expenseCategoryId: string;
}

export interface DebtPaymentFinancialEffectPort {
  registerPayment(
    input: RegisterDebtPaymentFinancialEffectInput,
  ): Promise<void>;
}
