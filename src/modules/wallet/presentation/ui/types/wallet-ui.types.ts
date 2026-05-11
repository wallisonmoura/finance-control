export type WalletUi = {
  id: string;
  userId: string;
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  createdAt: string;
  updatedAt: string;
  walletTotal: number;
};

export type UpdateWalletBalancesPayload = {
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
};
