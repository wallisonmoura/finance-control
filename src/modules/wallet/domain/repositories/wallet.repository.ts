import { Wallet } from '../entities/wallet.entity';

export interface WalletRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  update(wallet: Wallet): Promise<Wallet>;
}
