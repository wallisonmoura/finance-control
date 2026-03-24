import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { CalculateMonthlySummaryInput } from '../dtos/calculate-monthly-summary.input';
import { MonthlySummaryOutput } from '../dtos/monthly-summary.output';

export class CalculateMonthlySummaryUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: CalculateMonthlySummaryInput,
  ): Promise<MonthlySummaryOutput> {
    const startDate = new Date(input.year, input.month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);

    const entries = await this.financialEntryRepository.findByUserIdAndPeriod(
      input.userId,
      startDate,
      endDate,
    );

    const totalIncome = entries
      .filter((entry) => entry.type === FinancialEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = entries
      .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      month: input.month,
      year: input.year,
      totalIncome,
      totalExpense,
      result: totalIncome - totalExpense,
    };
  }
}
