import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/shared/presentation/ui/components/card';
import { cn } from '@/shared/presentation/ui/lib/utils';

import { IncomeGoalProgressUi, IncomeGoalsOverviewUi } from '../types/finance-ui.types';
import {
  describeIncomeGoal,
  getIncomeGoalStatusLabel,
  INCOME_GOAL_STATUS_TONE,
  IncomeGoalKind,
  IncomeGoalTone,
} from '../utils/format-income-goal';
import { GoalSegment } from '../utils/format-spending-goal';
import { IncomeGoalsInvite } from './income-goals-invite';

const PARTS: Record<IncomeGoalKind, { label: string; linkLabel: string; href: string; id: string }> = {
  profit: {
    label: 'Lucro',
    linkLabel: 'Ver lucro',
    href: '/relatorios/metas/lucro',
    // One strip per page (the Painel), so fixed ids are enough.
    id: 'monthly-income-goal-profit',
  },
  revenue: {
    label: 'Faturamento',
    linkLabel: 'Ver faturamento',
    href: '/relatorios/metas/faturamento',
    id: 'monthly-income-goal-revenue',
  },
};

const STATUS_TEXT_CLASS_NAME: Record<IncomeGoalTone, string> = {
  income: 'text-income',
  warning: 'text-warning',
  neutral: 'text-muted-foreground',
};

const BAR_CLASS_NAME: Record<IncomeGoalTone, string> = {
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

// The status already sits beside the title, so the detail drops its
// "No ritmo. " / "Abaixo do ritmo. " prefix.
function withoutPacePrefix(detail: GoalSegment[]): GoalSegment[] {
  const [first, ...rest] = detail;

  if (!first) {
    return detail;
  }

  return [{ ...first, text: first.text.replace(/^(No ritmo|Abaixo do ritmo)\. /, '') }, ...rest];
}

type GoalPartProps = {
  kind: IncomeGoalKind;
  progress: IncomeGoalProgressUi;
  // Profit is the figure the owner follows most, so it gets the bigger value.
  highlighted: boolean;
  className?: string;
};

function GoalPart({ kind, progress, highlighted, className }: GoalPartProps) {
  const part = PARTS[kind];
  const tone = INCOME_GOAL_STATUS_TONE[progress.status];
  const statusLabel = getIncomeGoalStatusLabel(progress.status, kind);
  const { usage, detail, perDay } = describeIncomeGoal(progress, kind);
  const detailSegments = withoutPacePrefix(detail);
  const detailText = [...detailSegments, ...(perDay ? [{ text: ' ' }, ...perDay] : [])]
    .map((segment) => segment.text)
    .join('');
  const percent = Math.min(Math.max(progress.progressPercent, 0), 100);

  return (
    <div role='group' aria-labelledby={part.id} className={cn('min-w-0 space-y-2', className)}>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1'>
        <div className='flex items-center gap-2 text-sm'>
          <h3 id={part.id} className='font-semibold text-foreground'>
            {part.label}
          </h3>
          <span aria-hidden='true' className='text-muted-foreground'>
            ·
          </span>
          <span className={cn('font-semibold', STATUS_TEXT_CLASS_NAME[tone])}>{statusLabel}</span>
        </div>
        <Link
          href={part.href}
          className='inline-flex items-center gap-1 text-sm font-semibold text-income hover:underline'
        >
          {part.linkLabel}
          <ArrowRight aria-hidden='true' className='size-4' />
        </Link>
      </div>

      <p
        className={cn(
          'font-semibold text-foreground',
          highlighted ? 'text-xl' : 'text-base',
        )}
      >
        {usage}
      </p>
      <p className='text-sm text-muted-foreground'>
        {detailSegments.map((segment, index) =>
          segment.tone ? (
            <span key={index} className={SEGMENT_CLASS_NAME[segment.tone]}>
              {segment.text}
            </span>
          ) : (
            segment.text
          ),
        )}
      </p>
      {/* Secondary: only helps who can earn more by working more. */}
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

      <div
        role='progressbar'
        aria-labelledby={part.id}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${usage}. ${statusLabel}. ${detailText}`}
        className='h-2 w-full overflow-hidden rounded-full bg-muted'
      >
        <div
          className={cn('h-full rounded-full', BAR_CLASS_NAME[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type MonthlyIncomeGoalsStripProps = {
  overview?: IncomeGoalsOverviewUi | null;
  error?: string | null;
};

// The income goals on the Painel, right below the hero: profit (highlighted)
// and revenue, each with its pace, a progress bar and how much is left per
// day. Editing and the spending goals stay in Relatórios → Metas.
export function MonthlyIncomeGoalsStrip({ overview, error }: MonthlyIncomeGoalsStripProps) {
  // A secondary figure: if it failed, the Painel goes on without it.
  if (error || !overview) {
    return null;
  }

  const { profit, revenue } = overview;

  if (!profit && !revenue) {
    return <IncomeGoalsInvite />;
  }

  const both = Boolean(profit && revenue);

  return (
    <Card className='space-y-4 p-5'>
      <h2 className='text-sm font-semibold text-muted-foreground'>Metas de ganho do mês</h2>

      <div className={cn('grid gap-5', both && 'lg:grid-cols-[3fr_2fr]')}>
        {profit ? <GoalPart kind='profit' progress={profit} highlighted /> : null}
        {revenue ? (
          <GoalPart
            kind='revenue'
            progress={revenue}
            highlighted={!profit}
            className={cn(
              both && 'border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5',
            )}
          />
        ) : null}
      </div>
    </Card>
  );
}
