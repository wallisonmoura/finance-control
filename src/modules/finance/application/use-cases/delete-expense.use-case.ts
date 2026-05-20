import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryLinkedToDebtError } from '../../domain/errors/financial-entry-linked-to-debt.error';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '../../domain/errors/unauthorized-financial-entry-access.error';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { DeleteExpenseInput } from '../dtos/delete-expense.input';

export class DeleteExpenseUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    const entry = await this.financialEntryRepository.findById(input.id);

    if (!entry) {
      throw new FinancialEntryNotFoundError();
    }

    if (entry.userId !== input.userId) {
      throw new UnauthorizedFinancialEntryAccessError();
    }

    if (entry.type !== FinancialEntryType.EXPENSE) {
      throw new FinancialEntryNotFoundError();
    }

    if (entry.isLinkedToDebt()) {
      throw new FinancialEntryLinkedToDebtError();
    }

    await this.financialEntryRepository.delete(entry.id);
  }
}
