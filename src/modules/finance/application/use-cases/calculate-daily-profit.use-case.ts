import { roundToCents } from '@/shared/domain/money/round-to-cents';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { CalculateDailyProfitInput } from '../dtos/calculate-daily-profit.input';
import { DailyProfitOutput } from '../dtos/daily-profit.output';

export class CalculateDailyProfitUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: CalculateDailyProfitInput): Promise<DailyProfitOutput> {
    const entries = await this.financialEntryRepository.findByUserIdAndDate(
      input.userId,
      input.date,
    );

    const totalIncome = roundToCents(
      entries
        .filter((entry) => entry.type === FinancialEntryType.INCOME)
        .reduce((sum, entry) => sum + entry.amount, 0),
    );

    const totalExpense = roundToCents(
      entries
        .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
        .reduce((sum, entry) => sum + entry.amount, 0),
    );

    return {
      date: input.date,
      totalIncome,
      totalExpense,
      profit: roundToCents(totalIncome - totalExpense),
    };
  }
}
