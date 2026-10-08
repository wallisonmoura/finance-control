'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EditSpendingGoalForm } from '@/modules/finance/presentation/ui/components/edit-spending-goal-form';
import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { useCategoryHistory } from '../hooks/use-category-history';
import { getCategoryHistoryHref, getCategoryLaunchesHref } from '../utils/category-history-links';
import { ReportsPeriodMonths } from '../utils/reports-period';
import { CategoryHistoryChart } from './category-history-chart';
import { CategoryHistorySkeleton } from './category-history-skeleton';
import { ReportsPeriodSelect } from './reports-period-select';

type CategoryHistoryPageContentProps = {
  categoryId: string;
  initialMonths: ReportsPeriodMonths;
};

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-card px-4 py-3'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 text-base font-semibold text-foreground'>{value}</p>
    </div>
  );
}

export function CategoryHistoryPageContent({
  categoryId,
  initialMonths,
}: CategoryHistoryPageContentProps) {
  const router = useRouter();
  const [months, setMonths] = useState<ReportsPeriodMonths>(initialMonths);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const { category, history, range, isLoading, notFound, error, refresh, setLimit } =
    useCategoryHistory(categoryId, months);

  const backLink = (
    <BackLink href={`/relatorios?months=${months}`}>Voltar para relatórios</BackLink>
  );

  function handleMonthsChange(nextMonths: ReportsPeriodMonths) {
    setMonths(nextMonths);
    router.push(getCategoryHistoryHref(categoryId, nextMonths), { scroll: false });
  }

  if (isLoading) {
    return <CategoryHistorySkeleton />;
  }

  if (notFound) {
    return (
      <div className='space-y-6'>
        {backLink}
        <EmptyState description='Categoria não encontrada.' />
      </div>
    );
  }

  if (error || !category || !history) {
    return (
      <div className='space-y-6'>
        {backLink}
        <LoadErrorState message={error ?? 'Não foi possível carregar o histórico.'} onRetry={refresh} />
      </div>
    );
  }

  const limit = category.monthlyLimit;

  return (
    <div className='space-y-6'>
      {backLink}

      <div className='flex flex-wrap items-end justify-between gap-4'>
        <PageTitle title={category.name} description='Gasto da categoria mês a mês.' />
        <ReportsPeriodSelect
          id='category-history-months'
          value={months}
          onChange={handleMonthsChange}
        />
      </div>

      {isEditingGoal ? (
        <Card className='p-5'>
          <EditSpendingGoalForm
            categoryId={category.id}
            categoryName={category.name}
            initialLimit={limit}
            average={history.averagePerMonth}
            averageLabel='Média por mês no período'
            onSaved={(savedLimit) => {
              setLimit(savedLimit);
              setIsEditingGoal(false);
            }}
            onCancel={() => setIsEditingGoal(false)}
          />
        </Card>
      ) : (
        <div className='flex flex-wrap items-center gap-3'>
          <p className='text-sm text-foreground'>
            {limit === null ? (
              'Sem meta'
            ) : (
              <>
                Meta: <span className='font-semibold'>{formatMoney(limit)}</span> por mês
              </>
            )}
          </p>
          <Button
            type='button'
            variant='secondary'
            className='h-9 px-3 text-sm'
            onClick={() => setIsEditingGoal(true)}
          >
            {limit === null ? 'Definir meta' : 'Editar meta'}
          </Button>
        </div>
      )}

      {!history.hasSpending ? (
        <EmptyState
          description={`Nenhum gasto em ${category.name} nos últimos ${months} meses.`}
        />
      ) : (
        <>
          <Card>
            <h2 className='text-base font-semibold text-foreground'>Gasto por mês</h2>
            <div className='mt-4'>
              <CategoryHistoryChart
                categoryName={category.name}
                months={history.months}
                monthlyLimit={limit}
              />
            </div>
          </Card>

          <div className='grid gap-4 sm:grid-cols-3'>
            <SummaryItem
              label='Média por mês'
              value={formatMoney(history.averagePerMonth ?? 0)}
            />
            <SummaryItem
              label='Maior mês'
              value={
                history.highestMonth
                  ? `${history.highestMonth.label} · ${formatMoney(history.highestMonth.total)}`
                  : '—'
              }
            />
            <SummaryItem label='Total no período' value={formatMoney(history.periodTotal)} />
          </div>

          {history.exceeded && (
            <p className='text-sm text-muted-foreground'>
              Passou do limite atual em{' '}
              <span className='font-semibold text-foreground'>
                {history.exceeded.count} de {history.exceeded.closedMonths}
              </span>{' '}
              meses fechados.
            </p>
          )}

          <Link
            href={getCategoryLaunchesHref({ categoryId: category.id, ...range })}
            className='inline-flex items-center gap-1 text-sm font-semibold text-income hover:underline'
          >
            Ver lançamentos
            <ArrowRight aria-hidden='true' className='size-4' />
          </Link>
        </>
      )}
    </div>
  );
}
