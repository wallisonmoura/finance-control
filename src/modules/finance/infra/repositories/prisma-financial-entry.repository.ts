import { prisma } from '@/shared/infra/database/prisma/client';
import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { PrismaFinancialEntryMapper } from '../mappers/prisma-financial-entry.mapper';
import {
  FinancialEntryRepository,
  PeriodTotals,
} from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { Prisma, TransactionType } from '@prisma/client';
import { DefaultWalletNotFoundError } from '../../../../shared/infra/errors/default-wallet-not-found.error';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry-not-found.error';
import { WalletRepository } from '@/modules/wallet/domain/repositories/wallet.repository';

export class PrismaFinancialEntryRepository implements FinancialEntryRepository {
  constructor(private readonly walletRepository: WalletRepository) {}

  async findById(id: string): Promise<FinancialEntry | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return null;
    }

    return PrismaFinancialEntryMapper.toDomain(transaction);
  }

  async findByUserId(userId: string): Promise<FinancialEntry[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
    });

    return transactions.map(PrismaFinancialEntryMapper.toDomain);
  }

  async create(entry: FinancialEntry): Promise<FinancialEntry> {
    const wallet = await this.walletRepository.findByUserId(entry.userId);

    if (!wallet) {
      throw new DefaultWalletNotFoundError();
    }

    const createdTransaction = await prisma.transaction.create({
      data: PrismaFinancialEntryMapper.toPersistence({
        userId: entry.userId,
        walletId: wallet.id,
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        date: entry.date,
        categoryId: entry.categoryId ?? null,
        notes: entry.notes ?? null,
      }),
    });

    return PrismaFinancialEntryMapper.toDomain(createdTransaction);
  }

  async update(entry: FinancialEntry): Promise<FinancialEntry> {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: entry.id },
      select: { id: true },
    });

    if (!existingTransaction) {
      throw new FinancialEntryNotFoundError();
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: entry.id },
      data: PrismaFinancialEntryMapper.toUpdatePersistence({
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        date: entry.date,
        categoryId: entry.categoryId ?? null,
        notes: entry.notes ?? null,
      }),
    });

    return PrismaFinancialEntryMapper.toDomain(updatedTransaction);
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<FinancialEntry[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: date,
      },
      orderBy: [{ createdAt: 'asc' }],
    });

    return transactions.map(PrismaFinancialEntryMapper.toDomain);
  }

  async findByUserIdAndPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<FinancialEntry[]> {
    const transactions = await prisma.transaction.findMany({
      where: this.buildPeriodWhere(
        userId,
        startDate,
        endDate,
        type,
        categoryId,
      ),
      orderBy: [{ transactionDate: 'asc' }, { createdAt: 'asc' }],
    });

    return transactions.map(PrismaFinancialEntryMapper.toDomain);
  }

  async getPeriodTotals(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<PeriodTotals> {
    const where = this.buildPeriodWhere(
      userId,
      startDate,
      endDate,
      type,
      categoryId,
    );

    const [sumsByType, count] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalIncome = this.sumForType(sumsByType, TransactionType.INCOME);
    const totalExpense = this.sumForType(sumsByType, TransactionType.EXPENSE);

    return { totalIncome, totalExpense, count };
  }

  async findByUserIdAndPeriodPaginated(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: FinancialEntryType | undefined,
    categoryId: string | undefined,
    pagination: { skip: number; take: number },
  ): Promise<FinancialEntry[]> {
    const transactions = await prisma.transaction.findMany({
      where: this.buildPeriodWhere(
        userId,
        startDate,
        endDate,
        type,
        categoryId,
      ),
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    });

    return transactions.map(PrismaFinancialEntryMapper.toDomain);
  }

  private buildPeriodWhere(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Prisma.TransactionWhereInput {
    return {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      ...(type
        ? {
            type:
              type === FinancialEntryType.INCOME
                ? TransactionType.INCOME
                : TransactionType.EXPENSE,
          }
        : {}),
      ...(categoryId ? { expenseCategoryId: categoryId } : {}),
    };
  }

  private sumForType(
    sumsByType: Array<{
      type: TransactionType;
      _sum: { amount: Prisma.Decimal | null };
    }>,
    type: TransactionType,
  ): number {
    const match = sumsByType.find((entry) => entry.type === type);

    return Number(match?._sum.amount ?? 0);
  }
}
