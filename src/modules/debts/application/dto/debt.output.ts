import { DebtPaymentSource } from '../../domain/enums/debt-payment-source.enum';
import { DebtStatus } from '../../domain/enums/debt-status.enum';
import { DebtType } from '../../domain/enums/debt-type.enum';

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
  paymentSource: DebtPaymentSource | null;
  createdAt: Date;
  updatedAt: Date;
}
