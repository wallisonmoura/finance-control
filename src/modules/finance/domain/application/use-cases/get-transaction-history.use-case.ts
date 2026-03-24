import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { GetTransactionHistoryInput } from '../dtos/get-transaction-history.input';
import { TransactionHistoryOutput } from '../dtos/transaction-history.output';

export class GetTransactionHistoryUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: GetTransactionHistoryInput,
  ): Promise<TransactionHistoryOutput> {
    const entries = await this.financialEntryRepository.findByUserIdAndPeriod(
      input.userId,
      input.startDate,
      input.endDate,
      input.type,
    );

    const sortedEntries = [...entries].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    const totalIncome = sortedEntries
      .filter((entry) => entry.type === FinancialEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = sortedEntries
      .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      entries: sortedEntries.map((entry) => entry.toJSON()),
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
