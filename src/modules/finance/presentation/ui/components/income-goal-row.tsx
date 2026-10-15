import Link from 'next/link';

import { cn } from '@/shared/presentation/ui/lib/utils';

import { IncomeGoalProgressUi } from '../types/finance-ui.types';
import {
  describeIncomeGoal,
  getIncomeGoalStatusLabel,
  INCOME_GOAL_STATUS_TONE,
  IncomeGoalKind,
  IncomeGoalTone,
} from '../utils/format-income-goal';
import { GoalSegment } from '../utils/format-spending-goal';

const DOT_CLASS_NAME: Record<IncomeGoalTone, string> = {
  income: 'bg-income',
  warning: 'bg-warning',
  neutral: 'bg-muted-foreground',
};

const SEGMENT_CLASS_NAME: Record<NonNullable<GoalSegment['tone']>, string> = {
  strong: 'font-semibold text-foreground',
  income: 'font-semibold text-income',
  warning: 'font-semibold text-warning',
  expense: 'font-semibold text-expense',
};

type IncomeGoalRowProps = {
  label: string;
  kind: IncomeGoalKind;
  progress: IncomeGoalProgressUi;
  // The goal's month-by-month history page.
  href: string;
};

export function IncomeGoalRow({ label, kind, progress, href }: IncomeGoalRowProps) {
  const { usage, detail, perDay } = describeIncomeGoal(progress, kind);

  return (
    <li className='flex gap-3'>
      <span
        aria-hidden='true'
        data-slot='income-goal-dot'
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          DOT_CLASS_NAME[INCOME_GOAL_STATUS_TONE[progress.status]],
        )}
      />
      <div className='min-w-0 flex-1 space-y-0.5'>
        <p className='text-sm font-semibold text-foreground'>
          <Link href={href} className='hover:underline'>
            {label}
          </Link>
        </p>
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
        {perDay ? (
          <p className='text-xs text-muted-foreground'>
            {perDay.map((segment, index) =>
              segment.tone ? (
                <span key={index} className={SEGMENT_CLASS_NAME[segment.tone]}>
                  {segment.text}
                </span>
              ) : (
                segment.text
              ),
            )}
          </p>
        ) : null}
        {/* The dot's color is decorative; screen readers get the status in words. */}
        <span className='sr-only'>Situação: {getIncomeGoalStatusLabel(progress.status, kind)}</span>
      </div>
    </li>
  );
}
