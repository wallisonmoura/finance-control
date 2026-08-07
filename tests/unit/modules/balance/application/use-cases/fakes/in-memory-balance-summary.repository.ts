import {
  BalanceSummaryData,
  BalanceSummaryRepository,
} from '@/modules/balance/domain/repositories/balance-summary.repository';

export class InMemoryBalanceSummaryRepository implements BalanceSummaryRepository {
  private dataByUserId = new Map<string, BalanceSummaryData>();

  async findByUserId(userId: string): Promise<BalanceSummaryData | null> {
    return this.dataByUserId.get(userId) ?? null;
  }

  setBalanceSummary(userId: string, data: BalanceSummaryData): void {
    this.dataByUserId.set(userId, data);
  }
}
