import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { FinancialEntryNotFoundError } from '../../errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '../../errors/unauthorized-financial-entry-access.error';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { DeleteIncomeInput } from '../dtos/delete-income.input';

export class DeleteIncomeUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: DeleteIncomeInput): Promise<void> {
    const entry = await this.financialEntryRepository.findById(input.id);

    if (!entry) {
      throw new FinancialEntryNotFoundError();
    }

    if (entry.userId !== input.userId) {
      throw new UnauthorizedFinancialEntryAccessError();
    }

    if (entry.type !== FinancialEntryType.INCOME) {
      throw new Error('Financial entry is not an income.');
    }

    await this.financialEntryRepository.delete(entry.id);
  }
}
