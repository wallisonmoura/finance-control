'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { EditIncomeGoalForm } from '@/modules/finance/presentation/ui/components/edit-income-goal-form';
import { IncomeGoalTargetsUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { SCREEN_HELP } from '@/shared/presentation/ui/help/screen-help';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { useIncomeGoalHistory } from '../hooks/use-income-goal-history';
import {
  describePeriodTotalNote,
  INCOME_GOAL_HISTORY_COPY,
} from '../utils/income-goal-history-copy';
import {
  getIncomeGoalHistoryHref,
  getIncomeGoalLaunchesHref,
} from '../utils/income-goal-history-links';
import { ReportsPeriodMonths } from '../utils/reports-period';
import { useReportsPeriod } from '../hooks/use-reports-period';
import { IncomeGoalHistoryChart } from './income-goal-history-chart';
import { IncomeGoalHistorySkeleton } from './income-goal-history-skeleton';
import { ReportsHistoryBodySkeleton } from './reports-history-body-skeleton';
import { ReportsPeriodSelect } from './reports-period-select';

type IncomeGoalHistoryPageContentProps = {
  measure: IncomeGoalKind;
  initialMonths: ReportsPeriodMonths;
  initialTargets: IncomeGoalTargetsUi;
  targetsError: string | null;
};

function SummaryItem({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | null;
}) {
  return (
    <div className='rounded-lg border border-border bg-card px-4 py-3'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 text-base font-semibold text-foreground'>{value}</p>
      {note ? (
        <p className='mt-0.5 text-xs text-muted-foreground'>{note}</p>
      ) : null}
    </div>
  );
}

export function IncomeGoalHistoryPageContent({
  measure,
  initialMonths,
  initialTargets,
  targetsError,
}: IncomeGoalHistoryPageContentProps) {
  const router = useRouter();
  const copy = INCOME_GOAL_HISTORY_COPY[measure];
  const [months, setMonths] = useReportsPeriod(initialMonths);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);
  const goalButtonRef = useRef<HTMLButtonElement>(null);
  const { history, targets, range, isLoading, error, refresh, setTargets } =
    useIncomeGoalHistory(measure, months, initialTargets);

  const target =
    measure === 'revenue' ? targets.revenueTarget : targets.profitTarget;

  // The form unmounts on save/cancel; send keyboard users back to its button.
  useEffect(() => {
    if (!isEditingGoal && shouldRestoreFocus) {
      goalButtonRef.current?.focus();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRestoreFocus(false);
    }
  }, [isEditingGoal, shouldRestoreFocus]);

  function closeForm() {
    setIsEditingGoal(false);
    setShouldRestoreFocus(true);
  }

  function handleMonthsChange(nextMonths: ReportsPeriodMonths) {
    setMonths(nextMonths);
    router.push(getIncomeGoalHistoryHref(measure, nextMonths), {
      scroll: false,
    });
  }

  const backLink = (
    <BackLink href='/relatorios/metas'>Voltar para metas</BackLink>
  );

  // First load: nothing to show yet. A later period change keeps the header
  // (and the focused period select) and only reloads the body below.
  if (isLoading && !history) {
    return <IncomeGoalHistorySkeleton />;
  }

  if (error || !history) {
    return (
      <div className='space-y-6'>
        {backLink}
        <LoadErrorState
          message={error ?? 'Não foi possível carregar o histórico.'}
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {backLink}

      <div className='flex flex-wrap items-end justify-between gap-4'>
        <PageTitle
          title={copy.title}
          description={copy.description}
          help={SCREEN_HELP[measure === 'profit' ? 'profitHistory' : 'revenueHistory']}
        />
        <ReportsPeriodSelect
          id='income-goal-history-months'
          value={months}
          onChange={handleMonthsChange}
        />
      </div>

      {targetsError ? (
        // Without the saved goals the form would resend the other goal as
        // empty and erase it, so editing waits for a successful load.
        <LoadErrorState
          message='Não foi possível carregar a meta.'
          onRetry={() => router.refresh()}
        />
      ) : isEditingGoal ? (
        <Card className='p-5'>
          <EditIncomeGoalForm
            measure={measure}
            targets={targets}
            average={history.averagePerMonth}
            averageLabel='Média por mês no período'
            onSaved={(saved) => {
              setTargets(saved);
              closeForm();
            }}
            onCancel={closeForm}
          />
        </Card>
      ) : (
        <div className='space-y-1'>
          <div className='flex flex-wrap items-center gap-3'>
            <p className='text-sm text-foreground'>
              {target === null ? (
                'Sem meta definida'
              ) : (
                <>
                  Meta:{' '}
                  <span className='font-semibold'>{formatMoney(target)}</span>{' '}
                  por mês
                </>
              )}
            </p>
            <Button
              ref={goalButtonRef}
              type='button'
              variant='secondary'
              className='h-9 px-3 text-sm'
              onClick={() => setIsEditingGoal(true)}
            >
              {target === null ? 'Definir meta' : 'Editar meta'}
            </Button>
          </div>
          {target === null ? (
            <p className='text-sm text-muted-foreground'>
              Defina uma meta para acompanhar mês a mês.
            </p>
          ) : null}
        </div>
      )}

      <div
        data-testid='history-body'
        aria-busy={isLoading || undefined}
        className='space-y-6'
      >
        {isLoading ? (
          <ReportsHistoryBodySkeleton />
        ) : !history.hasData ? (
          <EmptyState
            description={`Nenhum lançamento nos últimos ${months} meses.`}
          />
        ) : (
          <>
            <Card>
              <h2 className='text-base font-semibold text-foreground'>
                {copy.chartTitle}
              </h2>
              <div className='mt-4'>
                <IncomeGoalHistoryChart
                  measure={measure}
                  history={history}
                  target={target}
                />
              </div>
            </Card>

            <div className='grid gap-4 sm:grid-cols-3'>
              <SummaryItem
                label='Média por mês'
                value={formatMoney(history.averagePerMonth ?? 0)}
              />
              <SummaryItem
                label='Melhor mês'
                value={
                  history.bestMonth
                    ? `${history.bestMonth.label} · ${formatMoney(history.bestMonth.value)}`
                    : '—'
                }
              />
              <SummaryItem
                label='Total no período'
                value={formatMoney(history.periodTotal)}
                note={describePeriodTotalNote(history)}
              />
            </div>

            {history.reached && (
              <p className='text-sm text-muted-foreground'>
                Bateu a meta em{' '}
                <span className='font-semibold text-foreground'>
                  {history.reached.count} de {history.reached.closedMonths}
                </span>{' '}
                meses fechados.
              </p>
            )}

            {history.negative.count > 0 && (
              <p className='text-sm text-muted-foreground'>
                Fechou no vermelho em{' '}
                <span className='font-semibold text-expense'>
                  {history.negative.count} de {history.negative.closedMonths}
                </span>{' '}
                meses fechados.
              </p>
            )}

            <Link
              href={getIncomeGoalLaunchesHref({ measure, ...range })}
              className='inline-flex items-center gap-1 text-sm font-semibold text-income hover:underline'
            >
              Ver lançamentos
              <ArrowRight aria-hidden='true' className='size-4' />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
