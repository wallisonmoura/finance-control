import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { CalculateDailyProfitUseCase } from '@/modules/finance/application/use-cases/calculate-daily-profit.use-case';


function makeDriftEntries() {
  const base = {
    userId: 'user-1',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Plain sums give 0.30000000000000004 income and 0.20000000000000004 result.
  return [
    FinancialEntry.create({ ...base, id: 'income-a', type: FinancialEntryType.INCOME, amount: 0.1, description: 'Venda A', date: new Date('2026-03-24T09:00:00.000Z'), categoryId: null }),
    FinancialEntry.create({ ...base, id: 'income-b', type: FinancialEntryType.INCOME, amount: 0.2, description: 'Venda B', date: new Date('2026-03-24T10:00:00.000Z'), categoryId: null }),
    FinancialEntry.create({ ...base, id: 'expense-a', type: FinancialEntryType.EXPENSE, amount: 0.1, description: 'Taxa', date: new Date('2026-03-24T11:00:00.000Z'), categoryId: 'category-1' }),
  ];
}

describe('CalculateDailyProfitUseCase', () => {
  it('should calculate a positive daily profit', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'income-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 300,
        description: 'Venda',
        date: new Date('2026-03-24T09:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 120,
        description: 'Combustível',
        date: new Date('2026-03-24T11:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new CalculateDailyProfitUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.totalIncome).toBe(300);
    expect(output.totalExpense).toBe(120);
    expect(output.profit).toBe(180);
  });

  it('should calculate a negative daily profit', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'income-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 100,
        description: 'Venda',
        date: new Date('2026-03-24T09:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 180,
        description: 'Despesa',
        date: new Date('2026-03-24T11:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new CalculateDailyProfitUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.totalIncome).toBe(100);
    expect(output.totalExpense).toBe(180);
    expect(output.profit).toBe(-80);
  });

  it('should return zero when there are no entries for the day', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new CalculateDailyProfitUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.totalIncome).toBe(0);
    expect(output.totalExpense).toBe(0);
    expect(output.profit).toBe(0);
  });
  it('should round the totals and the profit to cents', async () => {
    const useCase = new CalculateDailyProfitUseCase(
      new InMemoryFinancialEntryRepository(makeDriftEntries()),
    );

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.totalIncome).toBe(0.3);
    expect(output.totalExpense).toBe(0.1);
    expect(output.profit).toBe(0.2);
  });
});
