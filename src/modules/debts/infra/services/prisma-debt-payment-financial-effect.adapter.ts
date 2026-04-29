import { prisma } from '@/shared/infra/database/prisma/client';
import {
  DebtPaymentFinancialEffectPort,
  RegisterDebtPaymentFinancialEffectInput,
} from '../../domain/services/debt-payment-financial-effect.port';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { Prisma, PrismaClient, TransactionType } from '@prisma/client';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';

type PrismaClientOrTransaction = PrismaClient | PrismaTransactionClient;

export class PrismaDebtPaymentFinancialEffectAdapter implements DebtPaymentFinancialEffectPort {
  constructor(private readonly client: PrismaClientOrTransaction = prisma) {}

  async registerPayment(
    input: RegisterDebtPaymentFinancialEffectInput,
  ): Promise<void> {
    const wallet = await this.client.wallet.findFirst({
      where: {
        userId: input.userId,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    if (!wallet) {
      throw new DefaultWalletNotFoundError();
    }

    const expenseCategory = await this.client.expenseCategory.findFirst({
      where: {
        id: input.expenseCategoryId,
        userId: input.userId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!expenseCategory) {
      throw new Error('Expense category not found.');
    }

    await this.client.transaction.create({
      data: {
        userId: input.userId,
        walletId: wallet.id,
        type: TransactionType.EXPENSE,
        amount: new Prisma.Decimal(input.amount),
        description: `Pagamento de dívida: ${input.description}`,
        notes: null,
        transactionDate: input.paidAt,
        expenseCategoryId: expenseCategory.id,
        debtId: input.debtId,
      },
    });
  }
}
