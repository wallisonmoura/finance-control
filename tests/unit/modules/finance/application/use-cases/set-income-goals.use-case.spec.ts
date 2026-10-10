import { SetIncomeGoalsUseCase } from '@/modules/finance/application/use-cases/set-income-goals.use-case';
import { InvalidIncomeGoalTargetError } from '@/modules/finance/domain/errors/invalid-income-goal-target.error';

import { InMemoryIncomeGoalRepository } from './fakes/in-memory-income-goal.repository';

describe('SetIncomeGoalsUseCase', () => {
  let repository: InMemoryIncomeGoalRepository;
  let sut: SetIncomeGoalsUseCase;

  beforeEach(() => {
    repository = new InMemoryIncomeGoalRepository();
    sut = new SetIncomeGoalsUseCase(repository);
  });

  it('should create the goals the first time', async () => {
    await expect(
      sut.execute({ userId: 'user-1', revenueTarget: 6000, profitTarget: 2000 }),
    ).resolves.toEqual({ revenueTarget: 6000, profitTarget: 2000 });

    expect((await repository.findByUserId('user-1'))?.revenueTarget).toBe(6000);
  });

  it('should update the same goal row and clear a target with null', async () => {
    await sut.execute({ userId: 'user-1', revenueTarget: 6000, profitTarget: 2000 });
    const first = await repository.findByUserId('user-1');

    await expect(
      sut.execute({ userId: 'user-1', revenueTarget: 7000, profitTarget: null }),
    ).resolves.toEqual({ revenueTarget: 7000, profitTarget: null });

    const second = await repository.findByUserId('user-1');
    expect(second?.id).toBe(first?.id);
    expect(second?.profitTarget).toBeNull();
  });

  it('should keep goals of different users apart', async () => {
    await sut.execute({ userId: 'user-1', revenueTarget: 6000, profitTarget: null });
    await sut.execute({ userId: 'user-2', revenueTarget: 1000, profitTarget: null });

    expect((await repository.findByUserId('user-1'))?.revenueTarget).toBe(6000);
  });

  it('should refuse a non-positive target without saving', async () => {
    await expect(
      sut.execute({ userId: 'user-1', revenueTarget: 0, profitTarget: null }),
    ).rejects.toThrow(InvalidIncomeGoalTargetError);

    await expect(repository.findByUserId('user-1')).resolves.toBeNull();
  });
});
