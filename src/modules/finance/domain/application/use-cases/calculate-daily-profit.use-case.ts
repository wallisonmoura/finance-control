import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
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

    const totalIncome = entries
      .filter((entry) => entry.type === FinancialEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = entries
      .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      date: input.date,
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
    };
  }
}
