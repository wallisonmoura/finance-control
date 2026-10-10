import { IncomeGoalProgressUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import {
  describeIncomeGoal,
  INCOME_GOAL_STATUS_LABEL,
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

  it('should congratulate a reached goal, with what passed it', () => {
    expect(
      text(describeIncomeGoal({ ...base, status: 'REACHED', exceededBy: 0 }, 'revenue').detail),
    ).toBe('Meta batida!');

    const { detail } = describeIncomeGoal({ ...base, status: 'REACHED', exceededBy: 500 }, 'revenue');
    expect(text(detail)).toBe(`Meta batida! ${formatMoney(500)} acima.`);
    expect(detail.find((segment) => segment.text === formatMoney(500))?.tone).toBe('income');
  });

  it('should tell the remaining amount per day when on pace', () => {
    expect(
      text(
        describeIncomeGoal(
          { ...base, status: 'ON_PACE', remaining: 2500, perDay: 156.25 },
          'revenue',
        ).detail,
      ),
    ).toBe(`No ritmo. Faltam ${formatMoney(2500)}, cerca de ${formatMoney(156.25)} por dia.`);
  });

  it('should warn when behind pace', () => {
    const { detail } = describeIncomeGoal(base, 'revenue');

    expect(text(detail)).toBe(
      `Abaixo do ritmo. Faltam ${formatMoney(4000)}, cerca de ${formatMoney(250)} por dia.`,
    );
    expect(detail.find((segment) => segment.text === formatMoney(250))?.tone).toBe('warning');
  });

  it('should only state what remains early in the month', () => {
    expect(text(describeIncomeGoal({ ...base, status: 'EARLY' }, 'revenue').detail)).toBe(
      `Faltam ${formatMoney(4000)}, cerca de ${formatMoney(250)} por dia.`,
    );
  });

  it('should map statuses to colors and to words', () => {
    expect(INCOME_GOAL_STATUS_TONE).toEqual({
      REACHED: 'income',
      ON_PACE: 'income',
      BEHIND: 'warning',
      EARLY: 'neutral',
    });
    expect(INCOME_GOAL_STATUS_LABEL).toEqual({
      REACHED: 'Meta batida',
      ON_PACE: 'No ritmo',
      BEHIND: 'Abaixo do ritmo',
      EARLY: 'Início do mês',
    });
  });
});
