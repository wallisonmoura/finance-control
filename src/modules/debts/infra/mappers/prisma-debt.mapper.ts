import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import {
  Debt as PrismaDebt,
  DebtStatus as PrismaDebtStatus,
  DebtType as PrismaDebtType,
  DebtPaymentSource as PrismaDebtPaymentSource,
  Prisma,
} from '@prisma/client';

export class PrismaDebtMapper {
  static toDomain(raw: PrismaDebt): Debt {
    return Debt.create({
      id: raw.id,
      userId: raw.userId,
      description: raw.description,
      amount: Number(raw.amount),
      dueDate: raw.dueDate,
      type: raw.type as DebtType,
      status: raw.status as DebtStatus,
      notes: raw.notes ?? null,
      paidAt: raw.paidAt ?? null,
      paymentSource: raw.paymentSource
        ? (raw.paymentSource as DebtPaymentSource)
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPrismaCreate(
    debt: Debt,
    walletId: string,
  ): Prisma.DebtUncheckedCreateInput {
    const data = debt.toJSON();

    return {
      id: data.id,
      userId: data.userId,
      walletId,
      description: data.description,
      amount: new Prisma.Decimal(data.amount),
      dueDate: data.dueDate,
      type: data.type as PrismaDebtType,
      status: data.status as PrismaDebtStatus,
      notes: data.notes,
      paidAt: data.paidAt,
      paymentSource: data.paymentSource
        ? (data.paymentSource as PrismaDebtPaymentSource)
        : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  static toPrismaUpdate(debt: Debt): Prisma.DebtUncheckedUpdateInput {
    const data = debt.toJSON();

    return {
      description: data.description,
      amount: new Prisma.Decimal(data.amount),
      dueDate: data.dueDate,
      type: data.type as PrismaDebtType,
      status: data.status as PrismaDebtStatus,
      notes: data.notes,
      paidAt: data.paidAt,
      paymentSource: data.paymentSource
        ? (data.paymentSource as PrismaDebtPaymentSource)
        : null,
      updatedAt: data.updatedAt,
    };
  }
}
