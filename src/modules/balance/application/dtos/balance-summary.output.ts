export interface BalanceSummaryOutput {
  wallet: {
    bankBalance: number;
    cashBalance: number;
    receivableBalance: number;
    walletTotal: number;
  };
  debts: {
    pendingDebts: number;
  };
  finalBalance: number;
}
