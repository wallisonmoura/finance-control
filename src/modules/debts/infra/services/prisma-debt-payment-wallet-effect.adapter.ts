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
      },
    });

    if (!wallet) {
      throw new DefaultWalletNotFoundError();
    }

    const amount = new Prisma.Decimal(input.amount);

    if (input.paymentSource === DebtPaymentSource.BANK) {
      const result = await this.client.wallet.updateMany({
        where: {
          id: wallet.id,
          bankBalance: {
            gte: amount,
          },
        },
        data: {
          bankBalance: {
            decrement: amount,
          },
        },
      });

      if (result.count === 0) {
        throw new InsufficientWalletBalanceError();
      }

      return;
    }

    if (input.paymentSource === DebtPaymentSource.CASH) {
      const result = await this.client.wallet.updateMany({
        where: {
          id: wallet.id,
          cashBalance: {
            gte: amount,
          },
        },
        data: {
          cashBalance: {
            decrement: amount,
          },
        },
      });

      if (result.count === 0) {
        throw new InsufficientWalletBalanceError();
      }

      return;
    }

    if (input.paymentSource === DebtPaymentSource.RECEIVABLE) {
      const result = await this.client.wallet.updateMany({
        where: {
          id: wallet.id,
          receivableBalance: {
            gte: amount,
          },
        },
        data: {
          receivableBalance: {
            decrement: amount,
          },
        },
      });

      if (result.count === 0) {
        throw new InsufficientWalletBalanceError();
      }

      return;
    }

    throw new Error('Invalid debt payment source.');
  }
}
