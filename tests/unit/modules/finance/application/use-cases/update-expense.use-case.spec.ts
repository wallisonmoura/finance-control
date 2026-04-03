import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';
import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { UpdateExpenseUseCase } from '@/modules/finance/application/use-cases/update-expense.use-case';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';

describe('UpdateExpenseUseCase', () => {
  it('Deve atualizar uma despesa com sucesso', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 80,
        description: 'Combustível',
        date: new Date('2026-03-23'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      ExpenseCategory.create({
        id: 'category-2',
        userId: 'user-1',
        name: 'Alimentação',
        slug: 'alimentacao',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    const output = await useCase.execute({
      id: 'expense-1',
      userId: 'user-1',
      amount: 120,
      description: 'Almoço',
      date: new Date('2026-03-24'),
      categoryId: 'category-2',
      notes: 'empresa',
    });

    expect(output.amount).toBe(120);
    expect(output.description).toBe('Almoço');
    expect(output.categoryId).toBe('category-2');
  });

  it('Deve falhar se a categoria não existir', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 80,
        description: 'Combustível',
        date: new Date('2026-03-23'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository();

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 120,
        description: 'Almoço',
        date: new Date('2026-03-24'),
        categoryId: 'category-inexistente',
      }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
  });
});
