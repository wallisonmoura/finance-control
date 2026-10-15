import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { IncomeGoalProgressUi, IncomeGoalStatusUi } from '../types/finance-ui.types';
import { GoalSegment } from './format-spending-goal';

export type IncomeGoalKind = 'revenue' | 'profit';
export type IncomeGoalTone = 'income' | 'warning' | 'neutral';

// Single source of an income goal's color; the status is always also given
// in words (getIncomeGoalStatusLabel), so color is never the only cue.
export const INCOME_GOAL_STATUS_TONE: Record<IncomeGoalStatusUi, IncomeGoalTone> = {
  REACHED: 'income',
  ON_PACE: 'income',
  BEHIND: 'warning',
  EARLY: 'neutral',
};

const INCOME_GOAL_STATUS_LABEL: Record<IncomeGoalStatusUi, string> = {
  REACHED: 'Meta batida',
  ON_PACE: 'No ritmo',
  BEHIND: 'Abaixo do ritmo',
  EARLY: 'Início do mês',
};

// These goals always describe the current month. Revenue never goes down, so a
// reached revenue goal is reached; profit still falls with every expense until
// the month ends, so profit above the goal is "Acima da meta" (room to spend),
// not a goal already reached.
export function getIncomeGoalStatusLabel(
  status: IncomeGoalStatusUi,
  kind: IncomeGoalKind,
): string {
  return kind === 'profit' && status === 'REACHED'
    ? 'Acima da meta'
    : INCOME_GOAL_STATUS_LABEL[status];
}

const PACE_PREFIX: Partial<Record<IncomeGoalStatusUi, string>> = {
  ON_PACE: 'No ritmo. ',
  BEHIND: 'Abaixo do ritmo. ',
};

export function describeIncomeGoal(
  progress: IncomeGoalProgressUi,
  kind: IncomeGoalKind,
): { usage: string; detail: GoalSegment[]; perDay: GoalSegment[] | null } {
  const usage =
    kind === 'profit' && progress.achieved < 0
      ? `Lucro até agora: ${formatMoney(progress.achieved)}`
      : `${formatMoney(progress.achieved)} de ${formatMoney(progress.target)} (${progress.progressPercent}%)`;

  if (progress.status === 'REACHED' && kind === 'profit') {
    return {
      usage,
      detail:
        progress.exceededBy > 0
          ? [
              { text: 'Você ainda pode gastar ' },
              { text: formatMoney(progress.exceededBy), tone: 'income' },
              { text: ' até o fim do mês e guardar ' },
              { text: formatMoney(progress.target), tone: 'strong' },
              { text: '.' },
            ]
          : [{ text: 'Lucro igual à meta: qualquer novo gasto fica abaixo dela.' }],
      perDay: null,
    };
  }

  if (progress.status === 'REACHED') {
    return {
      usage,
      detail:
        progress.exceededBy > 0
          ? [
              { text: 'Meta batida! ' },
              { text: formatMoney(progress.exceededBy), tone: 'income' },
              { text: ' acima.' },
            ]
          : [{ text: 'Meta batida!' }],
      perDay: null,
    };
  }

  // The amount per day is secondary: it only helps who can earn more by
  // working more (variable income); for a fixed income it is just arithmetic.
  return {
    usage,
    detail: [
      { text: `${PACE_PREFIX[progress.status] ?? ''}Faltam ` },
      { text: formatMoney(progress.remaining), tone: 'strong' },
      { text: ' pra meta.' },
    ],
    perDay: [
      { text: 'Cerca de ' },
      {
        text: formatMoney(progress.perDay),
        tone: progress.status === 'BEHIND' ? 'warning' : 'strong',
      },
      { text: ' por dia.' },
    ],
  };
}
