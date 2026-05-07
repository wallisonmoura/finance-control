export type BalanceSummaryWalletUi = {
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  walletTotal: number;
};

export type BalanceSummaryDebtsUi = {
  pendingDebts: number;
};

export type BalanceSummaryUi = {
  wallet: BalanceSummaryWalletUi;
  debts: BalanceSummaryDebtsUi;
  finalBalance: number;
};
