import { DebtType } from '../../domain/enums/debt-type.enum';

export interface UpdateDebtInput {
  userId: string;
  id: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  type?: DebtType;
  notes?: string | null;
}
