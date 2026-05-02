export type BalanceSummaryData = {
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  pendingDebts: number;
};

export interface BalanceSummaryRepository {
  getByUserId(userId: string): Promise<BalanceSummaryData | null>;
}
