import { Prisma, Transaction, TransactionType } from '@prisma/client';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntry } from '../../domain/entities/financial-entry.entity';

type TransactionPersistenceInput = {
  userId: string;
  walletId: string;
  type: FinancialEntryType;
  amount: number;
  description: string;
  date: Date;
  categoryId?: string | null;
  notes?: string | null;
};

export class PrismaFinancialEntryMapper {
  static toDomain(transaction: Transaction): FinancialEntry {
    return FinancialEntry.create({
      id: transaction.id,
      userId: transaction.userId,
      type:
        transaction.type === TransactionType.INCOME
          ? FinancialEntryType.INCOME
          : FinancialEntryType.EXPENSE,
      amount: Number(transaction.amount),
      description: transaction.description,
      date: transaction.transactionDate,
      categoryId: transaction.expenseCategoryId ?? null,
      notes: transaction.notes ?? null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  }

  static toPersistence(
    input: TransactionPersistenceInput,
  ): Prisma.TransactionUncheckedCreateInput {
    return {
      userId: input.userId,
      walletId: input.walletId,
      type:
        input.type === FinancialEntryType.INCOME
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
      amount: new Prisma.Decimal(input.amount),
      description: input.description,
      transactionDate: input.date,
      expenseCategoryId:
        input.type === FinancialEntryType.EXPENSE
          ? (input.categoryId ?? null)
          : null,
      notes: input.notes ?? null,
      debtId: null,
    };
  }

  static toUpdatePersistence(
    input: Omit<TransactionPersistenceInput, 'userId' | 'walletId'>,
  ): Prisma.TransactionUncheckedUpdateInput {
    return {
      type:
        input.type === FinancialEntryType.INCOME
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
      amount: new Prisma.Decimal(input.amount),
      description: input.description,
      transactionDate: input.date,
      expenseCategoryId:
        input.type === FinancialEntryType.EXPENSE
          ? (input.categoryId ?? null)
          : null,
      notes: input.notes ?? null,
    };
  }
}
