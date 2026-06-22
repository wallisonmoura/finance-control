import { prisma } from '@/shared/infra/database/prisma/client';
import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { PrismaFinancialEntryMapper } from '../mappers/prisma-financial-entry.mapper';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { TransactionType } from '@prisma/client';
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
  ): Promise<FinancialEntry[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
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
      },
      orderBy: [{ transactionDate: 'asc' }, { createdAt: 'asc' }],
    });

    return transactions.map(PrismaFinancialEntryMapper.toDomain);
  }
}
