import { prisma } from '@/shared/infra/database/prisma/client';
import { PrismaClient, DebtStatus as PrismaDebtStatus } from '@prisma/client';
import { Debt } from '../../domain/entities/debt.entity';
import { PrismaDebtMapper } from '../mappers/prisma-debt.mapper';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';

type PrismaClientOrTransaction = PrismaClient | PrismaTransactionClient;

export class PrismaDebtRepository implements DebtRepository {
  constructor(private readonly client: PrismaClientOrTransaction = prisma) {}

  async findById(id: string): Promise<Debt | null> {
    const debt = await this.client.debt.findUnique({
      where: {
        id,
      },
    });

    if (!debt) {
      return null;
    }

    return PrismaDebtMapper.toDomain(debt);
  }

  async findByUserId(userId: string): Promise<Debt[]> {
    const debts = await this.client.debt.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          dueDate: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return debts.map(PrismaDebtMapper.toDomain);
  }

  async findPendingByUserId(userId: string): Promise<Debt[]> {
    const debts = await this.client.debt.findMany({
      where: {
        userId,
        status: PrismaDebtStatus.PENDING,
      },
      orderBy: [
        {
          dueDate: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return debts.map(PrismaDebtMapper.toDomain);
  }

  async create(debt: Debt): Promise<Debt> {
    const data = debt.toJSON();

    const wallet = await this.client.wallet.findFirst({
      where: {
        userId: data.userId,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    if (!wallet) {
      throw new DefaultWalletNotFoundError();
    }

    const createdDebt = await this.client.debt.create({
      data: PrismaDebtMapper.toPrismaCreate(debt, wallet.id),
    });

    return PrismaDebtMapper.toDomain(createdDebt);
  }

  async update(debt: Debt): Promise<Debt> {
    const data = debt.toJSON();

    const updatedDebt = await this.client.debt.update({
      where: {
        id: data.id,
      },
      data: PrismaDebtMapper.toPrismaUpdate(debt),
    });

    return PrismaDebtMapper.toDomain(updatedDebt);
  }

  async delete(id: string): Promise<void> {
    await this.client.debt.delete({
      where: {
        id,
      },
    });
  }

  async findGeneratedFrom(debtId: string, userId: string): Promise<Debt | null> {
    const debt = await this.client.debt.findFirst({
      where: {
        generatedFromDebtId: debtId,
        userId,
      },
    });

    return debt ? PrismaDebtMapper.toDomain(debt) : null;
  }

  // Conditional on status PAID: two concurrent undos both read PAID, but the
  // second one blocks on the row lock and then matches no row.
  async markPaymentUndone(debt: Debt): Promise<boolean> {
    const data = debt.toJSON();

    const result = await this.client.debt.updateMany({
      where: {
        id: data.id,
        userId: data.userId,
        status: PrismaDebtStatus.PAID,
      },
      data: {
        status: PrismaDebtStatus.PENDING,
        paidAt: null,
        paymentSource: null,
        paymentRecordedAt: null,
        updatedAt: data.updatedAt,
      },
    });

    return result.count === 1;
  }

  async deletePendingGeneratedFrom(debtId: string, userId: string): Promise<number> {
    const result = await this.client.debt.deleteMany({
      where: {
        generatedFromDebtId: debtId,
        userId,
        status: PrismaDebtStatus.PENDING,
      },
    });

    return result.count;
  }
}
