import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { getInsightPeriods } from '../../domain/services/insight-periods';
import { buildSpendingGoals } from '../../domain/services/spending-goals';
import { GetSpendingGoalsInput } from '../dtos/get-spending-goals.input';
import { SpendingGoalsOutput } from '../dtos/spending-goals.output';

export class GetSpendingGoalsUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: GetSpendingGoalsInput): Promise<SpendingGoalsOutput> {
    const todayValue = getCurrentBusinessDateValue();
    const periods = getInsightPeriods(todayValue, 'current');

    // One query covers the 3 closed months (average hint) up to today.
    const [entries, categories] = await Promise.all([
      this.financialEntryRepository.findByUserIdAndPeriod(
        input.userId,
        periods.queryStart,
        periods.queryEndExclusive,
      ),
      this.expenseCategoryRepository.findByUserId(input.userId),
    ]);

    return buildSpendingGoals({ categories, entries, todayValue });
  }
}
