import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { ExpenseCategoryNotFoundError } from '../../domain/errors/expense-category-not-found.error';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '../../domain/errors/unauthorized-financial-entry-access.error';
import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { UpdateExpenseInput } from '../dtos/update-expense.input';

export class UpdateExpenseUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: UpdateExpenseInput): Promise<FinancialEntryOutput> {
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

    const category = await this.expenseCategoryRepository.findById(
      input.categoryId,
    );

    if (!category || category.userId !== input.userId) {
      throw new ExpenseCategoryNotFoundError();
    }

    const updatedEntry = entry.update({
      amount: input.amount,
      description: input.description,
      date: input.date,
      categoryId: input.categoryId,
      notes: input.notes ?? null,
    });

    const savedEntry = await this.financialEntryRepository.update(updatedEntry);

    return savedEntry.toJSON();
  }
}
