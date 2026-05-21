import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import {
  FinancialEntry,
  FinancialEntryProps,
} from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';
import { UpdateExpenseUseCase } from '@/modules/finance/application/use-cases/update-expense.use-case';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { InvalidFinancialEntryAmountError } from '@/modules/finance/domain/errors/invalid-financial-entry-amount.error';
import { FinancialEntryLinkedToDebtError } from '@/modules/finance/domain/errors/financial-entry-linked-to-debt.error';

describe('UpdateExpenseUseCase', () => {
  const makeExpense = (
    override?: Partial<FinancialEntryProps>,
  ): FinancialEntry => {
    return FinancialEntry.create({
      id: 'expense-1',
      userId: 'user-1',
      type: FinancialEntryType.EXPENSE,
      amount: 80,
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

  const makeCategory = (override?: {
    id?: string;
    userId?: string;
    name?: string;
    slug?: string;
    isActive?: boolean;
  }): ExpenseCategory => {
    return ExpenseCategory.create({
      id: override?.id ?? 'category-2',
      userId: override?.userId ?? 'user-1',
      name: override?.name ?? 'Alimentação',
      slug: override?.slug ?? 'alimentacao',
      isActive: override?.isActive ?? true,
      createdAt: new Date('2026-03-23T10:00:00Z'),
      updatedAt: new Date('2026-03-23T10:00:00Z'),
    });
  };

  it('deve atualizar uma despesa com sucesso', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
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

    expect(output.id).toBe('expense-1');
    expect(output.userId).toBe('user-1');
    expect(output.type).toBe(FinancialEntryType.EXPENSE);
    expect(output.amount).toBe(120);
    expect(output.description).toBe('Almoço');
    expect(output.date).toEqual(new Date('2026-03-24'));
    expect(output.categoryId).toBe('category-2');
    expect(output.notes).toBe('empresa');
  });

  it('deve persistir a atualização da despesa no repositório', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await useCase.execute({
      id: 'expense-1',
      userId: 'user-1',
      amount: 150,
      description: 'Despesa persistida',
      date: new Date('2026-03-25'),
      categoryId: 'category-2',
      notes: 'persistido',
    });

    const found = await financialEntryRepository.findById('expense-1');

    expect(found).not.toBeNull();
    expect(found?.amount).toBe(150);
    expect(found?.description).toBe('Despesa persistida');
    expect(found?.date).toEqual(new Date('2026-03-25'));
    expect(found?.categoryId).toBe('category-2');
    expect(found?.notes).toBe('persistido');
  });

  it('deve definir notes como null quando notes não for informado', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense({
        notes: 'observação antiga',
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
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
    });

    expect(output.notes).toBeNull();
  });

  it('deve falhar se a despesa não existir', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

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
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);
  });

  it('deve falhar se a despesa pertencer a outro usuário', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense({
        id: 'expense-1',
        userId: 'user-2',
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

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
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(UnauthorizedFinancialEntryAccessError);
  });

  it('deve falhar se o lançamento não for uma despesa', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeIncome({
        id: 'income-1',
        userId: 'user-1',
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 120,
        description: 'Tentativa de atualizar receita como despesa',
        date: new Date('2026-03-24'),
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);

    const found = await financialEntryRepository.findById('income-1');

    expect(found).not.toBeNull();
    expect(found?.type).toBe(FinancialEntryType.INCOME);
    expect(found?.amount).toBe(100);
    expect(found?.description).toBe('Venda');
    expect(found?.categoryId).toBeNull();
  });

  it('deve falhar se a despesa estiver vinculada a uma dívida paga', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense({
        id: 'expense-1',
        debtId: 'debt-1',
      }),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 120,
        description: 'Tentativa de atualizar pagamento de dívida',
        date: new Date('2026-03-24'),
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(FinancialEntryLinkedToDebtError);

    const found = await financialEntryRepository.findById('expense-1');

    expect(found?.amount).toBe(80);
    expect(found?.description).toBe('Combustível');
    expect(found?.debtId).toBe('debt-1');
  });

  it('deve falhar se a categoria não existir', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
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

  it('deve falhar se a categoria pertencer a outro usuário', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory({
        id: 'category-2',
        userId: 'user-2',
      }),
    ]);

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
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
  });

  it('deve falhar se o valor atualizado for inválido', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 0,
        description: 'Despesa inválida',
        date: new Date('2026-03-24'),
        categoryId: 'category-2',
      }),
    ).rejects.toThrow(InvalidFinancialEntryAmountError);
  });

  it('deve falhar se a descrição atualizada for inválida', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 120,
        description: '',
        date: new Date('2026-03-24'),
        categoryId: 'category-2',
      }),
    ).rejects.toThrow('Descrição é obrigatória.');
  });

  it('deve falhar se a data atualizada for inválida', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      makeExpense(),
    ]);

    const expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      makeCategory(),
    ]);

    const useCase = new UpdateExpenseUseCase(
      financialEntryRepository,
      expenseCategoryRepository,
    );

    await expect(
      useCase.execute({
        id: 'expense-1',
        userId: 'user-1',
        amount: 120,
        description: 'Despesa atualizada',
        date: new Date('invalid-date'),
        categoryId: 'category-2',
      }),
    ).rejects.toThrow('Data válida é obrigatória.');
  });
});
