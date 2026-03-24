import { FinancialEntryType } from '../../enums/financial-entry-type.enum';
import { ExpenseCategoryNotFoundError } from '../../errors/expense-category-not-found.error';
import { FinancialEntryNotFoundError } from '../../errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '../../errors/unauthorized-financial-entry-access.error';
import { ExpenseCategoryRepository } from '../../repositories/expense-category.repository';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
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
      throw new Error('Financial entry is not an expense.');
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
