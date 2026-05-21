import {
  FinancialEntry,
  FinancialEntryProps,
} from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { InvalidFinancialEntryAmountError } from '@/modules/finance/domain/errors/invalid-financial-entry-amount.error';

describe('UpdateIncomeUseCase', () => {
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

  it('deve atualizar um ganho com sucesso', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome(),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    const output = await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
      amount: 180,
      description: 'Venda atualizada',
      date: new Date('2026-03-24'),
      notes: 'ajuste',
    });

    expect(output.id).toBe('income-1');
    expect(output.userId).toBe('user-1');
    expect(output.amount).toBe(180);
    expect(output.description).toBe('Venda atualizada');
    expect(output.date).toEqual(new Date('2026-03-24'));
    expect(output.type).toBe(FinancialEntryType.INCOME);
    expect(output.categoryId).toBeNull();
    expect(output.notes).toBe('ajuste');
  });

  it('deve persistir a atualização do ganho no repositório', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome(),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
      amount: 250,
      description: 'Venda persistida',
      date: new Date('2026-03-25'),
      notes: 'persistido',
    });

    const found = await financialEntryRepository.findById('income-1');

    expect(found).not.toBeNull();
    expect(found?.amount).toBe(250);
    expect(found?.description).toBe('Venda persistida');
    expect(found?.date).toEqual(new Date('2026-03-25'));
    expect(found?.categoryId).toBeNull();
    expect(found?.notes).toBe('persistido');
  });

  it('deve definir notes como null quando notes não for informado', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome({
        notes: 'observação antiga',
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    const output = await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
      amount: 180,
      description: 'Venda sem observação',
      date: new Date('2026-03-24'),
    });

    expect(output.notes).toBeNull();
  });

  it('deve manter categoryId null mesmo se a receita anterior tiver categoryId inconsistente', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome({
        categoryId: 'category-1',
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    const output = await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
      amount: 180,
      description: 'Venda atualizada',
      date: new Date('2026-03-24'),
      notes: 'ajuste',
    });

    expect(output.categoryId).toBeNull();
  });

  it('deve falhar se o ganho não existir', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: 'Venda atualizada',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);
  });

  it('deve falhar se o ganho pertencer a outro usuário', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome({
        id: 'income-1',
        userId: 'user-2',
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: 'Venda atualizada',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(UnauthorizedFinancialEntryAccessError);
  });

  it('deve falhar se o lançamento não for um ganho', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense({
        id: 'expense-1',
        userId: 'user-1',
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 180,
        description: 'Tentativa de atualizar despesa como ganho',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);

    const found = await financialEntryRepository.findById('expense-1');

    expect(found).not.toBeNull();
    expect(found?.type).toBe(FinancialEntryType.EXPENSE);
    expect(found?.amount).toBe(100);
    expect(found?.description).toBe('Combustível');
    expect(found?.categoryId).toBe('category-1');
  });

  it('deve falhar se o valor atualizado for inválido', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome(),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 0,
        description: 'Venda inválida',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(InvalidFinancialEntryAmountError);
  });

  it('deve falhar se a descrição atualizada for inválida', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome(),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: '',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow('Descrição é obrigatória.');
  });

  it('deve falhar se a data atualizada for inválida', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome(),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: 'Venda atualizada',
        date: new Date('invalid-date'),
      }),
    ).rejects.toThrow('Data válida é obrigatória.');
  });
});
