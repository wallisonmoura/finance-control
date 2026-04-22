import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { WalletRepository } from '@/modules/wallet/domain/repositories/wallet.repository';

export class InMemoryWalletRepository implements WalletRepository {
  constructor(private readonly wallets: Wallet[] = []) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.wallets.find((wallet) => wallet.userId === userId) ?? null;
  }

  async update(wallet: Wallet): Promise<Wallet> {
    const index = this.wallets.findIndex((item) => item.id === wallet.id);

    if (index === -1) {
      this.wallets.push(wallet);
      return wallet;
    }

    this.wallets[index] = wallet;
    return wallet;
  }
}
