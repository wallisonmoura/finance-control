import { IncomeGoalProgressUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import {
  describeIncomeGoal,
  getIncomeGoalStatusLabel,
  INCOME_GOAL_STATUS_TONE,
} from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { GoalSegment } from '@/modules/finance/presentation/ui/utils/format-spending-goal';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

const base: IncomeGoalProgressUi = {
  target: 6000,
  achieved: 2000,
  expectedSoFar: 3000,
  remaining: 4000,
  daysLeft: 16,
  perDay: 250,
  progressPercent: 33,
  exceededBy: 0,
  status: 'BEHIND',
};

function text(segments: GoalSegment[]) {
  return segments.map((segment) => segment.text).join('');
}

describe('describeIncomeGoal', () => {
  it('should describe the progress against the target', () => {
    expect(describeIncomeGoal(base, 'revenue').usage).toBe(
      `${formatMoney(2000)} de ${formatMoney(6000)} (33%)`,
    );
  });

  it('should show a negative profit as the profit so far', () => {
    expect(
      describeIncomeGoal({ ...base, achieved: -300, progressPercent: 0 }, 'profit').usage,
    ).toBe(`Lucro até agora: ${formatMoney(-300)}`);
  });

  it('should congratulate a reached revenue goal, with what passed it', () => {
    // Revenue never goes down, so a reached revenue goal stays reached.
    expect(
      text(describeIncomeGoal({ ...base, status: 'REACHED', exceededBy: 0 }, 'revenue').detail),
    ).toBe('Meta batida!');

    const { detail, perDay } = describeIncomeGoal(
      { ...base, status: 'REACHED', exceededBy: 500 },
      'revenue',
    );
    expect(text(detail)).toBe(`Meta batida! ${formatMoney(500)} acima.`);
    expect(detail.find((segment) => segment.text === formatMoney(500))?.tone).toBe('income');
    expect(perDay).toBeNull();
  });

  it('should tell how much can still be spent when profit is above the goal', () => {
    // Expenses keep coming until the month ends, so profit above the goal is
    // room to spend, not a goal already reached.
    const { detail, perDay } = describeIncomeGoal(
      { ...base, target: 1000, achieved: 3350, status: 'REACHED', exceededBy: 2350 },
      'profit',
    );

    expect(text(detail)).toBe(
      `Você ainda pode gastar ${formatMoney(2350)} até o fim do mês e guardar ${formatMoney(1000)}.`,
    );
    expect(detail.find((segment) => segment.text === formatMoney(2350))?.tone).toBe('income');
    expect(perDay).toBeNull();
  });

  it('should say a profit exactly at the goal leaves no room to spend', () => {
    expect(
      text(
        describeIncomeGoal(
          { ...base, target: 1000, achieved: 1000, status: 'REACHED', exceededBy: 0 },
          'profit',
        ).detail,
      ),
    ).toBe('Lucro igual à meta: qualquer novo gasto fica abaixo dela.');
  });

  it('should tell what remains, with the amount per day on its own secondary line', () => {
    const { detail, perDay } = describeIncomeGoal(
      { ...base, status: 'ON_PACE', remaining: 2500, perDay: 156.25 },
      'revenue',
    );

    expect(text(detail)).toBe(`No ritmo. Faltam ${formatMoney(2500)} pra meta.`);
    expect(text(perDay ?? [])).toBe(`Cerca de ${formatMoney(156.25)} por dia.`);
  });

  it('should warn when behind pace', () => {
    const { detail, perDay } = describeIncomeGoal(base, 'revenue');

    expect(text(detail)).toBe(`Abaixo do ritmo. Faltam ${formatMoney(4000)} pra meta.`);
    expect(perDay?.find((segment) => segment.text === formatMoney(250))?.tone).toBe('warning');
  });

  it('should only state what remains early in the month', () => {
    expect(text(describeIncomeGoal({ ...base, status: 'EARLY' }, 'revenue').detail)).toBe(
      `Faltam ${formatMoney(4000)} pra meta.`,
    );
  });

  it('should map statuses to colors and to words', () => {
    expect(INCOME_GOAL_STATUS_TONE).toEqual({
      REACHED: 'income',
      ON_PACE: 'income',
      BEHIND: 'warning',
      EARLY: 'neutral',
    });
    expect(getIncomeGoalStatusLabel('REACHED', 'revenue')).toBe('Meta batida');
    expect(getIncomeGoalStatusLabel('REACHED', 'profit')).toBe('Acima da meta');
    expect(getIncomeGoalStatusLabel('ON_PACE', 'profit')).toBe('No ritmo');
    expect(getIncomeGoalStatusLabel('BEHIND', 'revenue')).toBe('Abaixo do ritmo');
    expect(getIncomeGoalStatusLabel('EARLY', 'profit')).toBe('Início do mês');
  });
});
