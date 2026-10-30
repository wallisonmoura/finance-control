import { roundToCents } from '@/shared/domain/money/round-to-cents';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
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
      entries: entries.map((entry) => entry.toJSON()),
      totalIncome,
      totalExpense,
      dailyProfit: roundToCents(totalIncome - totalExpense),
    };
  }
}
