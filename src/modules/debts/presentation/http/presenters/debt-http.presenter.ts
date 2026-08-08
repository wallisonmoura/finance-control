import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';

export interface DebtHttpResponse {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDate: string;
  type: DebtType;
  status: DebtStatus;
  notes: string | null;
  paidAt: string | null;
  paymentSource: DebtPaymentSource | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DebtHttpPresenter {
  static toResponse(debt: DebtOutput): DebtHttpResponse {
    return {
      id: debt.id,
      userId: debt.userId,
      description: debt.description,
      amount: debt.amount,
      dueDate: debt.dueDate.toISOString().slice(0, 10),
      type: debt.type,
      status: debt.status,
      notes: debt.notes ?? null,
      paidAt: debt.paidAt ? debt.paidAt.toISOString().slice(0, 10) : null,
      paymentSource: debt.paymentSource ?? null,
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt,
    };
  }

  static toResponseList(debts: DebtOutput[]): DebtHttpResponse[] {
    return debts.map((debt) => DebtHttpPresenter.toResponse(debt));
  }
}
