import { randomUUID } from 'node:crypto';

import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';

type MakeTestDebtEntityInput = {
  id?: string;
  userId: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  type?: DebtType;
  status?: DebtStatus;
  notes?: string | null;
  paidAt?: Date | null;
  paymentSource?: DebtPaymentSource | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function makeTestDebtEntity(input: MakeTestDebtEntityInput): Debt {
  const status = input.status ?? DebtStatus.PENDING;

  return Debt.create({
    id: input.id ?? randomUUID(),
    userId: input.userId,
    description: input.description ?? 'Dívida de teste',
    amount: input.amount ?? 100,
    dueDate: input.dueDate ?? new Date('2026-05-15T00:00:00.000Z'),
    type: input.type ?? DebtType.ONE_TIME,
    status,
    notes: input.notes ?? null,
    paidAt:
      input.paidAt ??
      (status === DebtStatus.PAID
        ? new Date('2026-05-10T00:00:00.000Z')
        : null),
    paymentSource:
      input.paymentSource ??
      (status === DebtStatus.PAID ? DebtPaymentSource.BANK : null),
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  });
}
