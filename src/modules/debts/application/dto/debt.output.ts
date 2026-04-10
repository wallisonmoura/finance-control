import { DebtStatus } from '../../domain/enum/debt-status.enum';
import { DebtType } from '../../domain/enum/debt-type.enum';

export interface DebtOutput {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDate: Date;
  type: DebtType;
  status: DebtStatus;
  notes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
