export interface WalletOutput {
  id: string;
  userId: string;
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  walletTotal: number;
  createdAt: Date;
  updatedAt: Date;
}
