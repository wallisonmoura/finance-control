import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetDailyTransactionsUseCase } from '@/modules/finance/domain/application/use-cases/get-daily-transactions.use-case';

describe('GetDailyTransactionsUseCase', () => {
  it('Deve retornar os lançamentos do dia com total e lucro diário', async () => {
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

  it('deve retornar zero quando não houver movimentações no dia', async () => {
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
});
