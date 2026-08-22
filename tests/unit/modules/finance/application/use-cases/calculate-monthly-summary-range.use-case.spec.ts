import { randomUUID } from 'node:crypto';
import { CalculateMonthlySummaryRangeUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary-range.use-case';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

jest.mock('@/shared/domain/date/business-date', () => ({
  getCurrentBusinessDateValue: jest.fn(),
}));

const mockedGetCurrentBusinessDateValue =
  getCurrentBusinessDateValue as jest.Mock;

function createEntry(
  userId: string,
  type: FinancialEntryType,
  amount: number,
  date: Date,
): FinancialEntry {
  return FinancialEntry.create({
    id: randomUUID(),
    userId,
    type,
    amount,
    description: 'Lançamento de teste',
    date,
    categoryId: type === FinancialEntryType.EXPENSE ? 'category-1' : null,
    createdAt: date,
    updatedAt: date,
  });
}

describe('CalculateMonthlySummaryRangeUseCase', () => {
  let financialEntryRepository: InMemoryFinancialEntryRepository;
  let sut: CalculateMonthlySummaryRangeUseCase;

  beforeEach(() => {
    financialEntryRepository = new InMemoryFinancialEntryRepository();
    sut = new CalculateMonthlySummaryRangeUseCase(financialEntryRepository);
  });

  it('should return 3 months, oldest first, ending in the current month', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

    const output = await sut.execute({ userId: 'user-1', months: 3 });

    expect(output).toEqual([
      { year: 2026, month: 6, totalIncome: 0, totalExpense: 0, result: 0 },
      { year: 2026, month: 7, totalIncome: 0, totalExpense: 0, result: 0 },
      { year: 2026, month: 8, totalIncome: 0, totalExpense: 0, result: 0 },
    ]);
  });

  it('should sum income and expense per month for the authenticated user', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

    await financialEntryRepository.create(
      createEntry(
        'user-1',
        FinancialEntryType.INCOME,
        1000,
        new Date(Date.UTC(2026, 6, 5)),
      ),
    );
    await financialEntryRepository.create(
      createEntry(
        'user-1',
        FinancialEntryType.EXPENSE,
        300,
        new Date(Date.UTC(2026, 6, 20)),
      ),
    );
    await financialEntryRepository.create(
      createEntry(
        'user-1',
        FinancialEntryType.INCOME,
        500,
        new Date(Date.UTC(2026, 7, 1)),
      ),
    );

    const output = await sut.execute({ userId: 'user-1', months: 3 });

    expect(output).toEqual([
      { year: 2026, month: 6, totalIncome: 0, totalExpense: 0, result: 0 },
      { year: 2026, month: 7, totalIncome: 1000, totalExpense: 300, result: 700 },
      { year: 2026, month: 8, totalIncome: 500, totalExpense: 0, result: 500 },
    ]);
  });

  it('should not include entries from another user', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

    await financialEntryRepository.create(
      createEntry(
        'other-user',
        FinancialEntryType.INCOME,
        9999,
        new Date(Date.UTC(2026, 7, 5)),
      ),
    );

    const output = await sut.execute({ userId: 'user-1', months: 1 });

    expect(output).toEqual([
      { year: 2026, month: 8, totalIncome: 0, totalExpense: 0, result: 0 },
    ]);
  });

  it('should roll over into the previous year when the window crosses January', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-02-10');

    const output = await sut.execute({ userId: 'user-1', months: 6 });

    expect(output.map((entry) => `${entry.year}-${entry.month}`)).toEqual([
      '2025-9',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-1',
      '2026-2',
    ]);
  });

  it('should return exactly 1 month when months is 1', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

    const output = await sut.execute({ userId: 'user-1', months: 1 });

    expect(output).toEqual([
      { year: 2026, month: 8, totalIncome: 0, totalExpense: 0, result: 0 },
    ]);
  });

  it('should return a clean 2-decimal sum, not a floating-point artifact', async () => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-08-15');

    // 1750.79 + 1931.39 === 3682.1800000000003 in plain JS floating point.
    await financialEntryRepository.create(
      createEntry(
        'user-1',
        FinancialEntryType.INCOME,
        1750.79,
        new Date(Date.UTC(2026, 7, 5)),
      ),
    );
    await financialEntryRepository.create(
      createEntry(
        'user-1',
        FinancialEntryType.INCOME,
        1931.39,
        new Date(Date.UTC(2026, 7, 20)),
      ),
    );

    const output = await sut.execute({ userId: 'user-1', months: 1 });

    expect(output[0].totalIncome).toBe(3682.18);
  });
});
