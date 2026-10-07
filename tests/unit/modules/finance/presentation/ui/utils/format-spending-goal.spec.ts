import { SpendingGoalUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import {
  describeSpendingGoal,
  GOAL_STATUS_TONE,
  GoalSegment,
} from '@/modules/finance/presentation/ui/utils/format-spending-goal';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

const base: Omit<SpendingGoalUi, 'status'> = {
  categoryId: 'b',
  categoryName: 'Bebida',
  limit: 300,
  spent: 180,
  usedPercent: 60,
  expectedSoFar: 150,
  projected: 360,
  remaining: 120,
  overBy: 0,
};

function text(segments: GoalSegment[]) {
  return segments.map((segment) => segment.text).join('');
}

describe('describeSpendingGoal', () => {
  it('should describe usage against the limit', () => {
    expect(describeSpendingGoal({ ...base, status: 'ON_TRACK' }).usage).toBe(
      `${formatMoney(180)} de ${formatMoney(300)} (60%)`,
    );
  });

  it('should tell how much is left when on track', () => {
    expect(text(describeSpendingGoal({ ...base, status: 'ON_TRACK' }).detail)).toBe(
      `Faltam ${formatMoney(120)}.`,
    );
  });

  it('should project the month when above pace', () => {
    const { detail } = describeSpendingGoal({ ...base, status: 'ABOVE_PACE' });

    expect(text(detail)).toBe(`No ritmo atual, vai fechar em ${formatMoney(360)}.`);
    expect(detail.find((segment) => segment.text === formatMoney(360))?.tone).toBe(
      'warning',
    );
  });

  it('should tell how much it passed when exceeded', () => {
    const { detail } = describeSpendingGoal({
      ...base,
      spent: 376.69,
      overBy: 76.69,
      remaining: 0,
      status: 'EXCEEDED',
    });

    expect(text(detail)).toBe(`Passou ${formatMoney(76.69)} da meta.`);
    expect(detail.find((segment) => segment.text === formatMoney(76.69))?.tone).toBe(
      'expense',
    );
  });

  it('should map statuses to colors', () => {
    expect(GOAL_STATUS_TONE).toEqual({
      EXCEEDED: 'expense',
      ABOVE_PACE: 'warning',
      ON_TRACK: 'income',
    });
  });
});
