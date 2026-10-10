'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';

import { IncomeGoalsOverviewUi } from '../types/finance-ui.types';
import { GoalsSectionHeader } from './goals-section-header';
import { IncomeGoalRow } from './income-goal-row';
import { IncomeGoalsForm } from './income-goals-form';

type IncomeGoalsSectionProps = {
  overview?: IncomeGoalsOverviewUi | null;
  error?: string | null;
};

export function IncomeGoalsSection({ overview, error }: IncomeGoalsSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);
  const actionRef = useRef<HTMLButtonElement>(null);

  // The form unmounts on save/cancel; send keyboard users back to the button
  // that opened it instead of letting focus fall to the top of the page.
  useEffect(() => {
    if (!isEditing && shouldRestoreFocus) {
      actionRef.current?.focus();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRestoreFocus(false);
    }
  }, [isEditing, shouldRestoreFocus]);

  function closeForm() {
    setIsEditing(false);
    setShouldRestoreFocus(true);
  }

  const hasGoals = Boolean(overview?.revenue || overview?.profit);

  const action =
    overview && !isEditing ? (
      <Button
        ref={actionRef}
        type='button'
        variant='secondary'
        onClick={() => setIsEditing(true)}
      >
        {hasGoals ? 'Editar metas de ganho' : 'Definir metas de ganho'}
      </Button>
    ) : null;

  return (
    <section className='space-y-4'>
      <GoalsSectionHeader
        title='Metas de ganho'
        description='Quanto você quer faturar e lucrar por mês, e quanto falta por dia.'
        action={action}
      />

      {error ? <LoadErrorState message={error} onRetry={() => router.refresh()} /> : null}

      {overview && isEditing ? (
        <Card className='p-5'>
          <IncomeGoalsForm
            initial={{
              revenueTarget: overview.revenue?.target ?? null,
              profitTarget: overview.profit?.target ?? null,
            }}
            averages={overview.averages}
            onSaved={() => {
              closeForm();
              router.refresh();
            }}
            onCancel={closeForm}
          />
        </Card>
      ) : null}

      {overview && !isEditing && !hasGoals ? (
        <Card className='p-5'>
          <p className='text-sm text-muted-foreground'>
            Defina quanto quer faturar e lucrar por mês.
          </p>
        </Card>
      ) : null}

      {overview && hasGoals ? (
        <Card className='p-5'>
          <ul className='space-y-5'>
            {overview.revenue ? (
              <IncomeGoalRow label='Faturamento' kind='revenue' progress={overview.revenue} />
            ) : null}
            {overview.profit ? (
              <IncomeGoalRow label='Lucro' kind='profit' progress={overview.profit} />
            ) : null}
          </ul>
        </Card>
      ) : null}
    </section>
  );
}
