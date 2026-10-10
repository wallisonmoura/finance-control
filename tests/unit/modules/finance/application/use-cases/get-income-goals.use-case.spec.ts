import { randomUUID } from 'node:crypto';

import { GetIncomeGoalsUseCase } from '@/modules/finance/application/use-cases/get-income-goals.use-case';
import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { IncomeGoal } from '@/modules/finance/domain/entities/income-goal.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { InMemoryIncomeGoalRepository } from './fakes/in-memory-income-goal.repository';

jest.mock('@/shared/domain/date/business-date', () => ({
  getCurrentBusinessDateValue: jest.fn(),
}));

const mockedGetCurrentBusinessDateValue = getCurrentBusinessDateValue as jest.Mock;

function income(userId: string, amount: number, date: string) {
  return FinancialEntry.create({
    id: randomUUID(),
    userId,
    type: FinancialEntryType.INCOME,
    amount,
    description: 'Receita',
    date: new Date(`${date}T00:00:00.000Z`),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetIncomeGoalsUseCase', () => {
  let entries: InMemoryFinancialEntryRepository;
  let sut: GetIncomeGoalsUseCase;

  beforeEach(() => {
    mockedGetCurrentBusinessDateValue.mockReturnValue('2026-09-15');
    entries = new InMemoryFinancialEntryRepository();
    const goals = new InMemoryIncomeGoalRepository([
      IncomeGoal.create({
        id: 'goal-1',
        userId: 'user-1',
        revenueTarget: 6000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
    sut = new GetIncomeGoalsUseCase(entries, goals);
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

  it('should only count entries of the given user', async () => {
    await entries.create(income('user-2', 5000, '2026-09-10'));
    await entries.create(income('user-1', 2000, '2026-09-10'));

    const output = await sut.execute({ userId: 'user-1' });

    expect(output.revenue).toMatchObject({ achieved: 2000, status: 'BEHIND' });
    expect(output.profit).toBeNull();
  });

  it('should return no goals for a user without a goal row', async () => {
    const output = await sut.execute({ userId: 'user-3' });

    expect(output.revenue).toBeNull();
    expect(output.profit).toBeNull();
  });
});
