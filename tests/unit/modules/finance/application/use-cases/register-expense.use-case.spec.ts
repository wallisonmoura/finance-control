import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { RegisterExpenseUseCase } from '@/modules/finance/application/use-cases/register-expense.use-case';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';

describe('RegisterExpenseUseCase', () => {
  it('should register an expense successfully', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      ExpenseCategory.create({
        id: 'category-1',
        userId: 'user-1',
        name: 'Combustível',
        slug: 'combustivel',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new RegisterExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    const output = await useCase.execute({
      userId: 'user-1',
      amount: 80,
      description: 'Abastecimento',
      date: new Date('2026-03-23'),
      categoryId: 'category-1',
    });

    expect(output.userId).toBe('user-1');
    expect(output.type).toBe(FinancialEntryType.EXPENSE);
    expect(output.amount).toBe(80);
    expect(output.categoryId).toBe('category-1');
  });

  it('should fail when the category does not exist', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository();

    const useCase = new RegisterExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        amount: 80,
        description: 'Abastecimento',
        date: new Date('2026-03-23'),
        categoryId: 'category-inexistente',
      }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
  });

  it('should fail when the category belongs to another user', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      ExpenseCategory.create({
        id: 'category-1',
        userId: 'user-2',
        name: 'Combustível',
        slug: 'combustivel',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new RegisterExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        amount: 80,
        description: 'Abastecimento',
        date: new Date('2026-03-23'),
        categoryId: 'category-1',
      }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
  });
});
