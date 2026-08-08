import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { CalculateMonthlySummaryUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary.use-case';

describe('CalculateMonthlySummaryUseCase', () => {
  it('should correctly calculate the summary for the given month and year', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 500,
        description: 'Venda 1',
        date: new Date('2026-03-10T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-2',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 200,
        description: 'Despesa 1',
        date: new Date('2026-03-12T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-3',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 1000,
        description: 'Outro mês',
        date: new Date('2026-04-01T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new CalculateMonthlySummaryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      month: 3,
      year: 2026,
    });

    expect(output.month).toBe(3);
    expect(output.year).toBe(2026);
    expect(output.totalIncome).toBe(500);
    expect(output.totalExpense).toBe(200);
    expect(output.result).toBe(300);
  });

  it('should not mix the same month from different years', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 400,
        description: 'Março 2025',
        date: new Date('2025-03-15T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-2',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 700,
        description: 'Março 2026',
        date: new Date('2026-03-15T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-3',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Despesa março 2026',
        date: new Date('2026-03-16T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new CalculateMonthlySummaryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      month: 3,
      year: 2026,
    });

    expect(output.totalIncome).toBe(700);
    expect(output.totalExpense).toBe(100);
    expect(output.result).toBe(600);
  });
});
