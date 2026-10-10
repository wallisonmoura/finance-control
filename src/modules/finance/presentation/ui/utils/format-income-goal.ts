import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { IncomeGoalProgressUi, IncomeGoalStatusUi } from '../types/finance-ui.types';
import { GoalSegment } from './format-spending-goal';

export type IncomeGoalKind = 'revenue' | 'profit';
export type IncomeGoalTone = 'income' | 'warning' | 'neutral';

// Single source of an income goal's color; the status is always also given
// in words (INCOME_GOAL_STATUS_LABEL), so color is never the only cue.
export const INCOME_GOAL_STATUS_TONE: Record<IncomeGoalStatusUi, IncomeGoalTone> = {
  REACHED: 'income',
  ON_PACE: 'income',
  BEHIND: 'warning',
  EARLY: 'neutral',
};

export const INCOME_GOAL_STATUS_LABEL: Record<IncomeGoalStatusUi, string> = {
  REACHED: 'Meta batida',
  ON_PACE: 'No ritmo',
  BEHIND: 'Abaixo do ritmo',
  EARLY: 'Início do mês',
};

const PACE_PREFIX: Partial<Record<IncomeGoalStatusUi, string>> = {
  ON_PACE: 'No ritmo. ',
  BEHIND: 'Abaixo do ritmo. ',
};

export function describeIncomeGoal(
  progress: IncomeGoalProgressUi,
  kind: IncomeGoalKind,
): { usage: string; detail: GoalSegment[] } {
  const usage =
    kind === 'profit' && progress.achieved < 0
      ? `Lucro até agora: ${formatMoney(progress.achieved)}`
      : `${formatMoney(progress.achieved)} de ${formatMoney(progress.target)} (${progress.progressPercent}%)`;

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
    };
  }

  return {
    usage,
    detail: [
      { text: `${PACE_PREFIX[progress.status] ?? ''}Faltam ` },
      { text: formatMoney(progress.remaining), tone: 'strong' },
      { text: ', cerca de ' },
      {
        text: formatMoney(progress.perDay),
        tone: progress.status === 'BEHIND' ? 'warning' : 'strong',
      },
      { text: ' por dia.' },
    ],
  };
}
