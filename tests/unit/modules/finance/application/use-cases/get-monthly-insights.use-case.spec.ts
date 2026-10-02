import { randomUUID } from 'node:crypto';

import { GetMonthlyInsightsUseCase } from '@/modules/finance/application/use-cases/get-monthly-insights.use-case';
import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';

jest.mock('@/shared/domain/date/business-date', () => ({
  getCurrentBusinessDateValue: jest.fn(),
}));

const mockedGetCurrentBusinessDateValue = getCurrentBusinessDateValue as jest.Mock;

function expense(userId: string, amount: number, date: string, categoryId: string) {
  return FinancialEntry.create({
    id: randomUUID(),
    userId,
    type: FinancialEntryType.EXPENSE,
    amount,
    description: 'Despesa de teste',
    date: new Date(`${date}T00:00:00.000Z`),
    categoryId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function category(id: string, userId: string, name: string, isActive: boolean) {
  return ExpenseCategory.create({
    id,
    userId,
    name,
    slug: name.toLowerCase(),
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetMonthlyInsightsUseCase', () => {
  let financialEntryRepository: InMemoryFinancialEntryRepository;
  let expenseCategoryRepository: InMemoryExpenseCategoryRepository;
  let sut: GetMonthlyInsightsUseCase;

  beforeEach(() => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-09-15');
    financialEntryRepository = new InMemoryFinancialEntryRepository();
    expenseCategoryRepository = new InMemoryExpenseCategoryRepository([
      category('cat-old', 'user-1', 'Antiga', false),
    ]);
    sut = new GetMonthlyInsightsUseCase(financialEntryRepository, expenseCategoryRepository);
  });

  it('should query entries once, covering both the current and the closed-month windows', async () => {
    const spy = jest.spyOn(financialEntryRepository, 'findByUserIdAndPeriod');

    await sut.execute({ userId: 'user-1' });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-05-01T00:00:00.000Z'),
      new Date('2026-09-16T00:00:00.000Z'),
    );
  });

  it('should resolve names of inactive categories', async () => {
    await financialEntryRepository.create(expense('user-1', 100, '2026-09-10', 'cat-old'));

    const output = await sut.execute({ userId: 'user-1' });

    expect(output.expenseInsights).toContainEqual(
      expect.objectContaining({ kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Antiga' }),
    );
  });

  it('should only use entries of the given user', async () => {
    await financialEntryRepository.create(expense('user-2', 100, '2026-09-10', 'cat-old'));

    const output = await sut.execute({ userId: 'user-1' });

    expect(output.hasEntries).toBe(false);
  });

  describe('closed month fallback', () => {
    beforeEach(() => {
      mockedGetCurrentBusinessDateValue.mockReturnValue('2026-10-02');
    });

    it('should query once, covering the closed-month window up to today', async () => {
      const spy = jest.spyOn(financialEntryRepository, 'findByUserIdAndPeriod');

      await sut.execute({ userId: 'user-1' });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        'user-1',
        new Date('2026-06-01T00:00:00.000Z'),
        new Date('2026-10-03T00:00:00.000Z'),
      );
    });

    it('should keep the current month when it already has entries', async () => {
      await financialEntryRepository.create(expense('user-1', 50, '2026-10-01', 'cat-old'));
      await financialEntryRepository.create(expense('user-1', 900, '2026-09-10', 'cat-old'));

      const output = await sut.execute({ userId: 'user-1' });

      expect(output).toMatchObject({
        isClosedMonth: false,
        referenceMonth: { year: 2026, month: 10 },
      });
    });

    it('should fall back to the last closed month when the current month is empty', async () => {
      await financialEntryRepository.create(expense('user-1', 900, '2026-09-10', 'cat-old'));

      const output = await sut.execute({ userId: 'user-1' });

      expect(output).toMatchObject({
        isClosedMonth: true,
        referenceMonth: { year: 2026, month: 9 },
        hasEntries: true,
      });
      expect(output.expenseInsights).toContainEqual(
        expect.objectContaining({ kind: 'TOP_EXPENSE_CATEGORY', amount: 900 }),
      );
    });

    it('should report no entries when both the current and the closed month are empty', async () => {
      const output = await sut.execute({ userId: 'user-1' });

      expect(output.hasEntries).toBe(false);
    });
  });
});
