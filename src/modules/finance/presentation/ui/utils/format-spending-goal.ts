import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { SpendingGoalStatusUi, SpendingGoalUi } from '../types/finance-ui.types';

export type GoalTone = 'income' | 'warning' | 'expense';

export type GoalSegment = {
  text: string;
  tone?: GoalTone | 'strong';
};

// Single source of a goal's color: the status dot and the highlighted value
// always agree.
export const GOAL_STATUS_TONE: Record<SpendingGoalStatusUi, GoalTone> = {
  EXCEEDED: 'expense',
  ABOVE_PACE: 'warning',
  ON_TRACK: 'income',
};

export function describeSpendingGoal(goal: SpendingGoalUi): {
  usage: string;
  detail: GoalSegment[];
} {
  const usage = `${formatMoney(goal.spent)} de ${formatMoney(goal.limit)} (${goal.usedPercent}%)`;

  if (goal.status === 'EXCEEDED') {
    return {
      usage,
      detail: [
        { text: 'Passou ' },
        { text: formatMoney(goal.overBy), tone: 'expense' },
        { text: ' da meta.' },
      ],
    };
  }

  if (goal.status === 'ABOVE_PACE' && goal.projected !== null) {
    return {
      usage,
      detail: [
        { text: 'No ritmo atual, vai fechar em ' },
        { text: formatMoney(goal.projected), tone: 'warning' },
        { text: '.' },
      ],
    };
  }

  return {
    usage,
    detail: [
      { text: 'Faltam ' },
      { text: formatMoney(goal.remaining), tone: 'strong' },
      { text: '.' },
    ],
  };
}
