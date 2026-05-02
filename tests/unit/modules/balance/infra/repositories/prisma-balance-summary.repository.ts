import {
  BalanceSummaryData,
  BalanceSummaryRepository,
} from '@/modules/balance/domain/repositories/balance-summary.repository';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { prisma } from '@/shared/infra/database/prisma/client';

export class PrismaBalanceSummaryRepository implements BalanceSummaryRepository {
  async getByUserId(userId: string): Promise<BalanceSummaryData | null> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      select: {
        bankBalance: true,
        cashBalance: true,
        receivableBalance: true,
      },
    });

    if (!wallet) {
      return null;
    }

    const pendingDebts = await prisma.debt.aggregate({
      where: {
        userId,
        status: DebtStatus.PENDING,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      bankBalance: Number(wallet.bankBalance),
      cashBalance: Number(wallet.cashBalance),
      receivableBalance: Number(wallet.receivableBalance),
      pendingDebts: Number(pendingDebts._sum.amount ?? 0),
    };
  }
}
