import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { getInsightPeriods } from '../../domain/services/insight-periods';
import { buildMonthlyInsights } from '../../domain/services/monthly-insights';
import { GetMonthlyInsightsInput } from '../dtos/get-monthly-insights.input';
import { MonthlyInsightsOutput } from '../dtos/monthly-insights.output';

export class GetMonthlyInsightsUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: GetMonthlyInsightsInput): Promise<MonthlyInsightsOutput> {
    const periods = getInsightPeriods(getCurrentBusinessDateValue());

    // One entries query covers the current month, the comparison period and
    // the closed months used by the income average.
    const [entries, categories] = await Promise.all([
      this.financialEntryRepository.findByUserIdAndPeriod(
        input.userId,
        periods.queryStart,
        periods.queryEndExclusive,
      ),
      // findByUserId (not findActiveByUserId): older entries may reference
      // a category that has since been deactivated.
      this.expenseCategoryRepository.findByUserId(input.userId),
    ]);

    return buildMonthlyInsights({
      entries,
      categoryNameById: new Map(categories.map((category) => [category.id, category.name])),
      periods,
    });
  }
}
