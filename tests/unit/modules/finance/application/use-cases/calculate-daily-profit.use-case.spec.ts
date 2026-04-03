import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { CalculateDailyProfitUseCase } from '@/modules/finance/application/use-cases/calculate-daily-profit.use-case';

describe('CalculateDailyProfitUseCase', () => {
  it('deve calcular lucro diário positivo', async () => {
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

  it('deve calcular lucro diário negativo', async () => {
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

  it('deve retornar zero quando não houver movimentações no dia', async () => {
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
});
