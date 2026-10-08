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

  if (goal.status === 'ABOVE_PACE') {
    return {
      usage,
      detail: [
        { text: 'Já usou ' },
        { text: `${goal.usedPercent}%`, tone: 'warning' },
        { text: ' da meta com ' },
        { text: `${goal.monthElapsedPercent}%`, tone: 'strong' },
        { text: ' do mês. Faltam ' },
        { text: formatMoney(goal.remaining), tone: 'strong' },
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
