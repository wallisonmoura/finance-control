import { DebtType } from '../../domain/enum/debt-type.enum';

export interface RegisterDebtInput {
  userId: string;
  description: string;
  amount: number;
  dueDate: Date;
  type: DebtType;
  notes?: string | null;
}
