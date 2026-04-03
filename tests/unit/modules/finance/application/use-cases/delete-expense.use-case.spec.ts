import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';

describe('DeleteExpenseUseCase', () => {
  it('Deve excluir uma despesa com sucesso', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Combustível',
        date: new Date('2026-03-23'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new DeleteExpenseUseCase(repository);

    await useCase.execute({
      id: 'expense-1',
      userId: 'user-1',
    });

    const found = await repository.findById('expense-1');

    expect(found).toBeNull();
  });
});
