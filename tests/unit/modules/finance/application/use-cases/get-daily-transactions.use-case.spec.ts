import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetDailyTransactionsUseCase } from '@/modules/finance/application/use-cases/get-daily-transactions.use-case';


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

describe('GetDailyTransactionsUseCase', () => {
  it('should return the entries of the day with total and daily profit', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'income-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 200,
        description: 'Venda do dia',
        date: new Date('2026-03-24T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'expense-1',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 50,
        description: 'Combustível',
        date: new Date('2026-03-24T15:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'income-2',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 999,
        description: 'Outro dia',
        date: new Date('2026-03-25T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetDailyTransactionsUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.entries).toHaveLength(2);
    expect(output.totalIncome).toBe(200);
    expect(output.totalExpense).toBe(50);
    expect(output.dailyProfit).toBe(150);
  });

  it('should return zero when there are no entries for the day', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new GetDailyTransactionsUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.entries).toHaveLength(0);
    expect(output.totalIncome).toBe(0);
    expect(output.totalExpense).toBe(0);
    expect(output.dailyProfit).toBe(0);
  });
  it('should round the totals and the daily profit to cents', async () => {
    const useCase = new GetDailyTransactionsUseCase(
      new InMemoryFinancialEntryRepository(makeDriftEntries()),
    );

    const output = await useCase.execute({
      userId: 'user-1',
      date: new Date('2026-03-24T00:00:00.000Z'),
    });

    expect(output.totalIncome).toBe(0.3);
    expect(output.totalExpense).toBe(0.1);
    expect(output.dailyProfit).toBe(0.2);
  });
});
