import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { IncomeGoalRepository } from '../../domain/repositories/income-goal.repository';
import { buildIncomeGoals } from '../../domain/services/income-goals';
import { getInsightPeriods } from '../../domain/services/insight-periods';
import { GetIncomeGoalsInput } from '../dtos/get-income-goals.input';
import { IncomeGoalsOutput } from '../dtos/income-goals.output';

export class GetIncomeGoalsUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
    private readonly incomeGoalRepository: IncomeGoalRepository,
  ) {}

  async execute(input: GetIncomeGoalsInput): Promise<IncomeGoalsOutput> {
    const todayValue = getCurrentBusinessDateValue();
    const periods = getInsightPeriods(todayValue, 'current');

    // One query covers the 3 closed months (average hint) up to today.
    const [entries, goal] = await Promise.all([
      this.financialEntryRepository.findByUserIdAndPeriod(
        input.userId,
        periods.queryStart,
        periods.queryEndExclusive,
      ),
      this.incomeGoalRepository.findByUserId(input.userId),
    ]);

    return buildIncomeGoals({ goal, entries, todayValue });
  }
}
