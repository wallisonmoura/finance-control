import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error';
import { WalletRepository } from '../../domain/repositories/wallet.repository';
import { UpdateWalletBalancesInput } from '../dtos/update-wallet-balances.input';
import { WalletOutput } from '../dtos/wallet.output';

export class UpdateWalletBalancesUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(input: UpdateWalletBalancesInput): Promise<WalletOutput> {
    const wallet = await this.walletRepository.findByUserId(input.userId);

    if (!wallet) {
      throw new WalletNotFoundError(input.userId);
    }

    const updatedWallet = wallet.update({
      bankBalance: input.bankBalance,
      cashBalance: input.cashBalance,
      receivableBalance: input.receivableBalance,
    });

    const persistedWallet = await this.walletRepository.update(updatedWallet);

    return {
      ...persistedWallet.toJSON(),
      walletTotal: persistedWallet.getWalletTotal(),
    };
  }
}
