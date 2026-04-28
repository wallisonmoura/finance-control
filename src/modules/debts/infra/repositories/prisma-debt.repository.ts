import { prisma } from '@/shared/infra/database/prisma/client';
import { DebtStatus as PrismaDebtStatus } from '@prisma/client';
import { Debt } from '../../domain/entities/debt.entity';
import { PrismaDebtMapper } from '../mappers/prisma-debt.mapper';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';

export class PrismaDebtRepository implements DebtRepository {
  async findById(id: string): Promise<Debt | null> {
    const debt = await prisma.debt.findUnique({
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
    const debts = await prisma.debt.findMany({
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
    const debts = await prisma.debt.findMany({
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

    const wallet = await prisma.wallet.findFirst({
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

    const createdDebt = await prisma.debt.create({
      data: PrismaDebtMapper.toPrismaCreate(debt, wallet.id),
    });

    return PrismaDebtMapper.toDomain(createdDebt);
  }

  async update(debt: Debt): Promise<Debt> {
    const data = debt.toJSON();

    const updatedDebt = await prisma.debt.update({
      where: {
        id: data.id,
      },
      data: PrismaDebtMapper.toPrismaUpdate(debt),
    });

    return PrismaDebtMapper.toDomain(updatedDebt);
  }

  async delete(id: string): Promise<void> {
    await prisma.debt.delete({
      where: {
        id,
      },
    });
  }
}
