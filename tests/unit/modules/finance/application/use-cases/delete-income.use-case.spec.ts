import {
  FinancialEntry,
  FinancialEntryProps,
} from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { DeleteIncomeUseCase } from '@/modules/finance/application/use-cases/delete-income.use-case';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';

describe('DeleteIncomeUseCase', () => {
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

  const makeExpense = (
    override?: Partial<FinancialEntryProps>,
  ): FinancialEntry => {
    return FinancialEntry.create({
      id: 'expense-1',
      userId: 'user-1',
      type: FinancialEntryType.EXPENSE,
      amount: 50,
      description: 'Combustível',
      date: new Date('2026-03-23'),
      categoryId: 'category-1',
      notes: null,
      createdAt: new Date('2026-03-23T10:00:00Z'),
      updatedAt: new Date('2026-03-23T10:00:00Z'),
      ...override,
    });
  };

  it('deve excluir um ganho com sucesso', async () => {
    const repository = new InMemoryFinancialEntryRepository([makeIncome()]);
    const useCase = new DeleteIncomeUseCase(repository);

    await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
    });

    const found = await repository.findById('income-1');

    expect(found).toBeNull();
  });

  it('deve lançar erro quando o ganho não existir', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new DeleteIncomeUseCase(repository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);
  });

  it('deve lançar erro quando o ganho pertencer a outro usuário', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      makeIncome({
        id: 'income-1',
        userId: 'other-user',
      }),
    ]);

    const useCase = new DeleteIncomeUseCase(repository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(UnauthorizedFinancialEntryAccessError);

    const found = await repository.findById('income-1');

    expect(found).not.toBeNull();
  });

  it('deve lançar erro quando o lançamento não for um ganho', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      makeExpense({
        id: 'expense-1',
        userId: 'user-1',
      }),
    ]);

    const useCase = new DeleteIncomeUseCase(repository);

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Financial entry is not an income.');

    const found = await repository.findById('expense-1');

    expect(found).not.toBeNull();
  });
});
