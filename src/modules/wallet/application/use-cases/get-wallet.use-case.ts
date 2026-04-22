import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error';
import { WalletRepository } from '../../domain/repositories/wallet.repository';
import { GetWalletInput } from '../dtos/get-wallet.input';
import { WalletOutput } from '../dtos/wallet.output';

export class GetWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(input: GetWalletInput): Promise<WalletOutput> {
    const wallet = await this.walletRepository.findByUserId(input.userId);

    if (!wallet) {
      throw new WalletNotFoundError(input.userId);
    }

    return {
      ...wallet.toJSON(),
      walletTotal: wallet.getWalletTotal(),
    };
  }
}
