import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { Prisma } from '@prisma/client';

type CreateTestDebtInput = {
  userId: string;
  walletId: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  type?: DebtType;
  status?: DebtStatus;
  notes?: string | null;
  paidAt?: Date | null;
  paymentSource?: DebtPaymentSource | null;
};

export async function createTestDebt(input: CreateTestDebtInput) {
  const status = input.status ?? DebtStatus.PENDING;

  return prisma.debt.create({
    data: {
      userId: input.userId,
      walletId: input.walletId,
      description: input.description ?? 'Dívida de teste',
      amount: new Prisma.Decimal(input.amount ?? 100),
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
    },
  });
}
