import {
  FinancialEntry,
  FinancialEntryProps,
} from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';

describe('DeleteExpenseUseCase', () => {
  const makeExpense = (
    override?: Partial<FinancialEntryProps>,
  ): FinancialEntry => {
    return FinancialEntry.create({
      id: 'expense-1',
      userId: 'user-1',
      type: FinancialEntryType.EXPENSE,
      amount: 100,
      description: 'Combustível',
      date: new Date('2026-03-23'),
      categoryId: 'category-1',
      notes: null,
      createdAt: new Date('2026-03-23T10:00:00Z'),
      updatedAt: new Date('2026-03-23T10:00:00Z'),
      ...override,
    });
  };

  const makeIncome = (
    override?: Partial<FinancialEntryProps>,
  ): FinancialEntry => {
    return FinancialEntry.create({
      id: 'income-1',
      userId: 'user-1',
      type: FinancialEntryType.INCOME,
      amount: 100,
      description: 'Venda',
      date: new Date('2026-03-23'),
      categoryId: null,
      notes: null,
      createdAt: new Date('2026-03-23T10:00:00Z'),
      updatedAt: new Date('2026-03-23T10:00:00Z'),
      ...override,
    });
  };

  it('deve excluir uma despesa com sucesso', async () => {
    const repository = new InMemoryFinancialEntryRepository([makeExpense()]);
    const useCase = new DeleteExpenseUseCase(repository);

    await useCase.execute({
      id: 'expense-1',
      userId: 'user-1',
    });

    const found = await repository.findById('expense-1');

    expect(found).toBeNull();
  });

  it('deve lançar erro quando a despesa não existir', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new DeleteExpenseUseCase(repository);

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);
  });

  it('deve lançar erro quando a despesa pertencer a outro usuário', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      makeExpense({
        id: 'expense-1',
        userId: 'other-user',
      }),
    ]);

    const useCase = new DeleteExpenseUseCase(repository);

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(UnauthorizedFinancialEntryAccessError);

    const found = await repository.findById('expense-1');

    expect(found).not.toBeNull();
  });

  it('deve lançar erro quando o lançamento não for uma despesa', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      makeIncome({
        id: 'income-1',
        userId: 'user-1',
      }),
    ]);

    const useCase = new DeleteExpenseUseCase(repository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Financial entry is not an expense.');

    const found = await repository.findById('income-1');

    expect(found).not.toBeNull();
  });
});
