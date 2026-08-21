export interface RegisterInstallmentDebtInput {
  userId: string;
  description: string;
  amount: number;
  dueDate: Date;
  installmentCount: number;
  notes?: string | null;
}
