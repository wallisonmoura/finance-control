export type BalanceSummaryData = {
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  pendingDebts: number;
};

export interface BalanceSummaryRepository {
  findByUserId(userId: string): Promise<BalanceSummaryData | null>;
}
