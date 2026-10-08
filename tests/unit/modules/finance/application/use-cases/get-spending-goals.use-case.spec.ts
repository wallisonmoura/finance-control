import { randomUUID } from 'node:crypto';

import { GetSpendingGoalsUseCase } from '@/modules/finance/application/use-cases/get-spending-goals.use-case';
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

function expense(userId: string, amount: number, date: string) {
  return FinancialEntry.create({
    id: randomUUID(),
    userId,
    type: FinancialEntryType.EXPENSE,
    amount,
    description: 'Despesa de teste',
    date: new Date(`${date}T00:00:00.000Z`),
    categoryId: 'bebida',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetSpendingGoalsUseCase', () => {
  let entries: InMemoryFinancialEntryRepository;
  let sut: GetSpendingGoalsUseCase;

  beforeEach(() => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-09-15');
    entries = new InMemoryFinancialEntryRepository();
    const categories = new InMemoryExpenseCategoryRepository([
      ExpenseCategory.create({
        id: 'bebida',
        userId: 'user-1',
        name: 'Bebida',
        slug: 'bebida',
        isActive: true,
        monthlyLimit: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
    sut = new GetSpendingGoalsUseCase(entries, categories);
  });

  it('should query entries once, from three closed months ago up to today', async () => {
    const spy = jest.spyOn(entries, 'findByUserIdAndPeriod');

    await sut.execute({ userId: 'user-1' });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-06-01T00:00:00.000Z'),
      new Date('2026-09-16T00:00:00.000Z'),
    );
  });

  it('should only count spending of the given user', async () => {
    await entries.create(expense('user-2', 500, '2026-09-10'));
    await entries.create(expense('user-1', 40, '2026-09-10'));

    const output = await sut.execute({ userId: 'user-1' });

    expect(output.goals).toHaveLength(1);
    expect(output.goals[0]).toMatchObject({ spent: 40, status: 'ON_TRACK' });
  });
});
