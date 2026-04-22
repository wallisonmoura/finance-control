import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error';
import { WalletRepository } from '../../domain/repositories/wallet.repository';
import { GetWalletSummaryInput } from '../dtos/get-wallet-summary.input';
import { GetWalletSummaryOutput } from '../dtos/get-wallet-summary.output';

export class GetWalletSummaryUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(input: GetWalletSummaryInput): Promise<GetWalletSummaryOutput> {
    const wallet = await this.walletRepository.findByUserId(input.userId);

    if (!wallet) {
      throw new WalletNotFoundError(input.userId);
    }

    return {
      wallet: {
        ...wallet.toJSON(),
        walletTotal: wallet.getWalletTotal(),
      },
    };
  }
}
