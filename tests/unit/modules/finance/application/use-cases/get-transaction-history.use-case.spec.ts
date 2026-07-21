import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';

describe('GetTransactionHistoryUseCase', () => {
  it('deve retornar lançamentos do período ordenados por data decrescente', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 300,
        description: 'Venda 1',
        date: new Date('2026-03-20T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-2',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Despesa 1',
        date: new Date('2026-03-22T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-3',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 150,
        description: 'Venda 2',
        date: new Date('2026-03-21T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetTransactionHistoryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      startDate: new Date('2026-03-20T00:00:00.000Z'),
      endDate: new Date('2026-03-22T23:59:59.999Z'),
    });

    expect(output.entries).toHaveLength(3);
    expect(output.entries[0].id).toBe('entry-2');
    expect(output.entries[1].id).toBe('entry-3');
    expect(output.entries[2].id).toBe('entry-1');
    expect(output.totalIncome).toBe(450);
    expect(output.totalExpense).toBe(100);
    expect(output.balance).toBe(350);
  });

  it('deve filtrar por tipo quando informado', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 300,
        description: 'Venda 1',
        date: new Date('2026-03-20T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-2',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Despesa 1',
        date: new Date('2026-03-21T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetTransactionHistoryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      startDate: new Date('2026-03-20T00:00:00.000Z'),
      endDate: new Date('2026-03-21T23:59:59.999Z'),
      type: FinancialEntryType.EXPENSE,
    });

    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].type).toBe(FinancialEntryType.EXPENSE);
    expect(output.totalIncome).toBe(0);
    expect(output.totalExpense).toBe(100);
    expect(output.balance).toBe(-100);
  });

  it('deve filtrar por categoria quando categoryId for informado', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new GetTransactionHistoryUseCase(repository);

    const userId = 'user-1';
    const categoryId = '11111111-1111-4111-8111-111111111111';
    const otherCategoryId = '22222222-2222-4222-8222-222222222222';

    await repository.create(
      FinancialEntry.create({
        id: 'entry-1',
        userId,
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Gasolina',
        date: new Date('2026-04-10T00:00:00.000Z'),
        categoryId,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await repository.create(
      FinancialEntry.create({
        id: 'entry-2',
        userId,
        type: FinancialEntryType.EXPENSE,
        amount: 50,
        description: 'Mercado',
        date: new Date('2026-04-11T00:00:00.000Z'),
        categoryId: otherCategoryId,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute({
      userId,
      startDate: new Date('2026-04-01T00:00:00.000Z'),
      endDate: new Date('2026-04-30T00:00:00.000Z'),
      type: FinancialEntryType.EXPENSE,
      categoryId,
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].description).toBe('Gasolina');
    expect(result.totalExpense).toBe(100);
  });
});
