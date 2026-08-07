import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';
import { BalanceSummaryRepository } from '../../domain/repositories/balance-summary.repository';
import { BalanceSummaryOutput } from '../dto/balance-summary.output';
import { GetBalanceSummaryInput } from '../dto/get-balance-summary.input';

export class GetBalanceSummaryUseCase {
  constructor(
    private readonly balanceSummaryRepository: BalanceSummaryRepository,
  ) {}

  async execute(input: GetBalanceSummaryInput): Promise<BalanceSummaryOutput> {
    const data = await this.balanceSummaryRepository.findByUserId(
      input.userId,
    );

    if (!data) {
      throw new WalletNotFoundError(input.userId);
    }

    const walletTotal =
      data.bankBalance + data.cashBalance + data.receivableBalance;

    const finalBalance = walletTotal - data.pendingDebts;

    return {
      wallet: {
        bankBalance: data.bankBalance,
        cashBalance: data.cashBalance,
        receivableBalance: data.receivableBalance,
        walletTotal,
      },
      debts: {
        pendingDebts: data.pendingDebts,
      },
      finalBalance,
    };
  }
}
