export type DebtTypeUi = 'ONE_TIME' | 'RECURRING';

export type DebtStatusUi = 'PENDING' | 'PAID';

export type DebtPaymentSourceUi = 'BANK' | 'CASH' | 'RECEIVABLE';

export type DebtUi = {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDate: string;
  type: DebtTypeUi;
  status: DebtStatusUi;
  notes: string | null;
  paidAt: string | null;
  paymentSource: DebtPaymentSourceUi | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterDebtUiInput = {
  description: string;
  amount: number;
  dueDate: string;
  type: DebtTypeUi;
  notes?: string | null;
};

export type UpdateDebtUiInput = RegisterDebtUiInput;

export type RegisterInstallmentDebtUiInput = {
  description: string;
  amount: number;
  dueDate: string;
  installmentCount: number;
  notes?: string | null;
};

export type PayDebtUiInput = {
  paidAt: string;
  expenseCategoryId: string;
  paymentSource: DebtPaymentSourceUi;
};

export type DebtApiResponse<T> = {
  data?: T;
  error?: string;
};
