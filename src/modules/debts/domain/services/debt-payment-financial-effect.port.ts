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
  // Deletes the expense created by the payment; returns how many were removed.
  removePayment(input: { debtId: string; userId: string }): Promise<number>;
}
