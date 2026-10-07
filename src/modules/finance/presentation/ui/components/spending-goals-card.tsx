import { Target } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/shared/presentation/ui/components/card';
import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

import { SpendingGoalsOverviewUi } from '../types/finance-ui.types';
import { SpendingGoalRow } from './spending-goal-row';

// The dashboard shows only the most critical goals; /metas lists them all.
const CARD_GOAL_LIMIT = 3;

type SpendingGoalsCardProps = {
  overview?: SpendingGoalsOverviewUi | null;
  error?: string | null;
};

function SpendingGoalsContent({ overview, error }: SpendingGoalsCardProps) {
  if (error) {
    return <StatusMessage tone='error' message={error} />;
  }

  if (!overview) {
    return null;
  }

  if (overview.goals.length === 0) {
    return (
      <Card className='flex flex-row items-center justify-between gap-3 p-5'>
        <p className='text-sm text-muted-foreground'>
          Defina metas pra segurar seus gastos.
        </p>
        <Link
          href='/metas'
          className='shrink-0 text-sm font-semibold text-income hover:underline'
        >
          Criar metas
        </Link>
      </Card>
    );
  }

  return (
    <Card className='p-5'>
      <ul className='space-y-4'>
        {overview.goals.slice(0, CARD_GOAL_LIMIT).map((goal) => (
          <SpendingGoalRow key={goal.categoryId} goal={goal} />
        ))}
      </ul>
    </Card>
  );
}

export function SpendingGoalsCard(props: SpendingGoalsCardProps) {
  const hasGoals = (props.overview?.goals.length ?? 0) > 0;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <Target aria-hidden='true' className='size-4 text-muted-foreground' />
          <h2>Metas do mês</h2>
        </div>

        {hasGoals && !props.error ? (
          <Link
            href='/metas'
            className='shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground'
          >
            Ver todas as metas
          </Link>
        ) : null}
      </div>

      <SpendingGoalsContent {...props} />
    </div>
  );
}
