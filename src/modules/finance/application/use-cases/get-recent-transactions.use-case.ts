import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { GetRecentTransactionsInput } from '../dtos/get-recent-transactions.input';

// The user's newest entries from any period, so the dashboard is not empty
// at the start of a month.
export class GetRecentTransactionsUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: GetRecentTransactionsInput): Promise<FinancialEntryOutput[]> {
    const entries = await this.financialEntryRepository.findLatestByUserId(
      input.userId,
      input.limit,
    );

    return entries.map((entry) => entry.toJSON());
  }
}
