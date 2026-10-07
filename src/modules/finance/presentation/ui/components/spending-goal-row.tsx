import type { ReactNode } from 'react';

import { cn } from '@/shared/presentation/ui/lib/utils';

import { SpendingGoalUi } from '../types/finance-ui.types';
import {
  describeSpendingGoal,
  GOAL_STATUS_TONE,
  GoalSegment,
  GoalTone,
} from '../utils/format-spending-goal';

const DOT_CLASS_NAME: Record<GoalTone, string> = {
  income: 'bg-income',
  warning: 'bg-warning',
  expense: 'bg-expense',
};

const SEGMENT_CLASS_NAME: Record<NonNullable<GoalSegment['tone']>, string> = {
  strong: 'font-semibold text-foreground',
  income: 'font-semibold text-income',
  warning: 'font-semibold text-warning',
  expense: 'font-semibold text-expense',
};

type SpendingGoalRowProps = {
  goal: SpendingGoalUi;
  // Optional controls shown on the right (Editar/Remover on /metas).
  actions?: ReactNode;
};

export function SpendingGoalRow({ goal, actions }: SpendingGoalRowProps) {
  const { usage, detail } = describeSpendingGoal(goal);

  return (
    <li className='flex gap-3'>
      <span
        aria-hidden='true'
        data-slot='goal-dot'
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          DOT_CLASS_NAME[GOAL_STATUS_TONE[goal.status]],
        )}
      />
      <div className='min-w-0 flex-1 space-y-0.5'>
        <p className='text-sm font-semibold text-foreground'>{goal.categoryName}</p>
        <p className='text-sm text-foreground'>{usage}</p>
        <p className='text-sm text-muted-foreground'>
          {detail.map((segment, index) =>
            segment.tone ? (
              <span key={index} className={SEGMENT_CLASS_NAME[segment.tone]}>
                {segment.text}
              </span>
            ) : (
              segment.text
            ),
          )}
        </p>
      </div>
      {actions ? <div className='flex shrink-0 items-start gap-2'>{actions}</div> : null}
    </li>
  );
}
