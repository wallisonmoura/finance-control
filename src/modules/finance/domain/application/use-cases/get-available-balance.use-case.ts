import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { AvailableBalanceOutput } from '../dtos/available-balance.output';
import { GetAvailableBalanceInput } from '../dtos/get-available-balance.input';

export class GetAvailableBalanceUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: GetAvailableBalanceInput,
  ): Promise<AvailableBalanceOutput> {
    const entries = await this.financialEntryRepository.findByUserId(
      input.userId,
    );

    const totalIncome = entries
      .filter((entry) => entry.type === FinancialEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = entries
      .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
