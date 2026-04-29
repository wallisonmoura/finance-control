import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';
import { DebtPaymentWalletEffectPort } from '../../domain/services/debt-payment-wallet-effect.port';
import { prisma } from '@/shared/infra/database/prisma/client';
import { DebtPaymentSource } from '../../domain/enums/debt-payment-source.enum';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';

type PrismaClientOrTransaction = PrismaClient | PrismaTransactionClient;

export class PrismaDebtPaymentWalletEffectAdapter implements DebtPaymentWalletEffectPort {
  constructor(private readonly client: PrismaClientOrTransaction = prisma) {}

  async debit(input: {
    userId: string;
    amount: number;
    paymentSource: DebtPaymentSource;
  }): Promise<void> {
    const wallet = await this.client.wallet.findFirst({
      where: {
        userId: input.userId,
        isDefault: true,
      },
      select: {
        id: true,
        bankBalance: true,
        cashBalance: true,
        receivableBalance: true,
      },
    });

    if (!wallet) {
      throw new DefaultWalletNotFoundError();
    }

    const amount = new Prisma.Decimal(input.amount);

    if (input.paymentSource === DebtPaymentSource.BANK) {
      if (wallet.bankBalance.lessThan(amount)) {
        throw new InsufficientWalletBalanceError();
      }

      await this.client.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          bankBalance: wallet.bankBalance.minus(amount),
        },
      });

      return;
    }

    if (input.paymentSource === DebtPaymentSource.CASH) {
      if (wallet.cashBalance.lessThan(amount)) {
        throw new InsufficientWalletBalanceError();
      }

      await this.client.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          cashBalance: wallet.cashBalance.minus(amount),
        },
      });

      return;
    }

    if (input.paymentSource === DebtPaymentSource.RECEIVABLE) {
      if (wallet.receivableBalance.lessThan(amount)) {
        throw new InsufficientWalletBalanceError();
      }

      await this.client.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          receivableBalance: wallet.receivableBalance.minus(amount),
        },
      });

      return;
    }

    throw new Error('Invalid debt payment source.');
  }
}
