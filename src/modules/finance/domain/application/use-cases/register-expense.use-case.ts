import { randomUUID } from 'node:crypto';
import { FinancialEntry } from '../../entities/financial-entry.entity';
import { ExpenseCategoryNotFoundError } from '../../errors/expense-category-not-found.error';
import { ExpenseCategoryRepository } from '../../repositories/expense-category.repository';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { RegisterExpenseInput } from '../dtos/register-expense.input';
import { FinancialEntryType } from '../../enums/financial-entry-type.enum';

export class RegisterExpenseUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: RegisterExpenseInput): Promise<FinancialEntryOutput> {
    const category = await this.expenseCategoryRepository.findById(
      input.categoryId,
    );

    if (!category || category.userId !== input.userId) {
      throw new ExpenseCategoryNotFoundError();
    }

    const now = new Date();

    const entry = FinancialEntry.create({
      id: randomUUID(),
      userId: input.userId,
      type: FinancialEntryType.EXPENSE,
      amount: input.amount,
      description: input.description,
      date: input.date,
      categoryId: input.categoryId,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const createdEntry = await this.financialEntryRepository.create(entry);

    return createdEntry.toJSON();
  }
}
