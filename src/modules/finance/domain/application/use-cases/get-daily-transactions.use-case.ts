import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { DailyTransactionsOutput } from '../dtos/daily-transactions.output';
import { GetDailyTransactionsInput } from '../dtos/get-daily-transactions.input';

export class GetDailyTransactionsUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: GetDailyTransactionsInput,
  ): Promise<DailyTransactionsOutput> {
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
      entries: entries.map((entry) => entry.toJSON()),
      totalIncome,
      totalExpense,
      dailyProfit: totalIncome - totalExpense,
    };
  }
}
