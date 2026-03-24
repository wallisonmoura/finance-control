import { randomUUID } from 'node:crypto';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { RegisterExpenseInput } from '../dtos/register-expense.input';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { ExpenseCategoryNotFoundError } from '../../domain/errors/expense-category-not-found.error';
import { FinancialEntry } from '../../domain/entities/financial-entry.entity';

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
