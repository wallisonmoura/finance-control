import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '../../domain/errors/unauthorized-financial-entry-access.error';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { UpdateIncomeInput } from '../dtos/update-income.input';

export class UpdateIncomeUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: UpdateIncomeInput): Promise<FinancialEntryOutput> {
    const entry = await this.financialEntryRepository.findById(input.id);

    if (!entry) {
      throw new FinancialEntryNotFoundError();
    }

    if (entry.userId !== input.userId) {
      throw new UnauthorizedFinancialEntryAccessError();
    }

    if (entry.type !== FinancialEntryType.INCOME) {
      throw new FinancialEntryNotFoundError();
    }

    const updatedEntry = entry.update({
      amount: input.amount,
      description: input.description,
      date: input.date,
      notes: input.notes ?? null,
      categoryId: null,
    });

    const savedEntry = await this.financialEntryRepository.update(updatedEntry);

    return savedEntry.toJSON();
  }
}
