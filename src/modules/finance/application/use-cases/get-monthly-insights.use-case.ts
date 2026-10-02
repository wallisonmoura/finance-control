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
    const today = getCurrentBusinessDateValue();
    const currentPeriods = getInsightPeriods(today, 'current');
    const closedPeriods = getInsightPeriods(today, 'closed');

    // One entries query covers both modes: the closed-month window starts
    // earlier, the current-month window ends later (today).
    const [entries, categories] = await Promise.all([
      this.financialEntryRepository.findByUserIdAndPeriod(
        input.userId,
        closedPeriods.queryStart,
        currentPeriods.queryEndExclusive,
      ),
      // findByUserId (not findActiveByUserId): older entries may reference
      // a category that has since been deactivated.
      this.expenseCategoryRepository.findByUserId(input.userId),
    ]);

    const categoryNameById = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    const currentInsights = buildMonthlyInsights({
      entries,
      categoryNameById,
      periods: currentPeriods,
    });

    if (currentInsights.hasEntries) {
      return currentInsights;
    }

    // Early in the month there is nothing to say about the current month yet,
    // so explain the month that just closed instead.
    const closedInsights = buildMonthlyInsights({
      entries,
      categoryNameById,
      periods: closedPeriods,
    });

    return closedInsights.hasEntries ? closedInsights : currentInsights;
  }
}
