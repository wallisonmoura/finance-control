import { IncomeGoal } from '@/modules/finance/domain/entities/income-goal.entity';
import { InvalidIncomeGoalTargetError } from '@/modules/finance/domain/errors/invalid-income-goal-target.error';

function goal(targets: { revenueTarget?: number | null; profitTarget?: number | null } = {}) {
  return IncomeGoal.create({
    id: 'goal-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...targets,
  });
}

describe('IncomeGoal', () => {
  it('should have no targets by default', () => {
    const created = goal();

    expect(created.revenueTarget).toBeNull();
    expect(created.profitTarget).toBeNull();
  });

  it('should accept positive targets', () => {
    const created = goal({ revenueTarget: 6000, profitTarget: 2000.5 });

    expect(created.revenueTarget).toBe(6000);
    expect(created.profitTarget).toBe(2000.5);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject a revenue target of %s',
    (value) => {
      expect(() => goal({ revenueTarget: value })).toThrow(InvalidIncomeGoalTargetError);
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject a profit target of %s',
    (value) => {
      expect(() => goal({ profitTarget: value })).toThrow(InvalidIncomeGoalTargetError);
    },
  );

  it('should change the targets without mutating the original', () => {
    const original = goal({ revenueTarget: 6000 });
    const changed = original.withTargets({ revenueTarget: null, profitTarget: 1500 });

    expect(changed.revenueTarget).toBeNull();
    expect(changed.profitTarget).toBe(1500);
    expect(changed.userId).toBe('user-1');
    expect(original.revenueTarget).toBe(6000);
    expect(original.profitTarget).toBeNull();
  });
});
