'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClipboardEvent, DragEvent, KeyboardEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Funnel,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import {
  FinanceOperationalSummaryDailyRow,
  FinanceOperationalSummaryFilters,
  useFinanceOperationalSummary,
} from '../hooks/use-finance-operational-summary';
import { MonthlySummaryUi } from '../types/finance-ui.types';
import {
  getOperationalSummaryFiltersFromUrlSearchParams,
  parseMonthInputValue,
  toMonthInputValue,
} from '../utils/finance-operational-summary';
import { FinanceBackLink } from './finance-back-link';
import { FinanceSummaryCardsSkeleton } from './finance-summary-cards-skeleton';
import { FinanceSummaryTableSkeleton } from './finance-summary-table-skeleton';

function toFinanceSummaryUrl(filters: FinanceOperationalSummaryFilters) {
  const searchParams = new URLSearchParams({
    month: toMonthInputValue(filters),
  });

  return `/finance/summary?${searchParams.toString()}`;
}

function areFiltersEqual(
  first: FinanceOperationalSummaryFilters,
  second: FinanceOperationalSummaryFilters,
) {
  return first.year === second.year && first.month === second.month;
}

type SummaryCardProps = {
  label: string;
  value: number;
  tone?: 'default' | 'income' | 'expense' | 'result';
  className?: string;
};

function SummaryCard({
  label,
  value,
  tone = 'default',
  className = '',
}: SummaryCardProps) {
  const Icon =
    tone === 'income' ? ArrowUp : tone === 'expense' ? ArrowDown : BarChart3;

  const toneClass =
    tone === 'income'
      ? 'text-income'
      : tone === 'expense'
        ? 'text-expense'
        : tone === 'result'
          ? value >= 0
            ? 'text-foreground'
            : 'text-expense'
          : 'text-foreground';

  const iconClass =
    tone === 'income'
      ? 'bg-income-muted text-income ring-income/20'
      : tone === 'expense'
        ? 'bg-expense-muted text-expense ring-expense/20'
        : 'bg-muted text-foreground ring-border';

  return (
    <Card className={`p-5 ${className}`}>
      <div className='flex items-center gap-4'>
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconClass}`}
        >
          <Icon aria-hidden='true' className='size-6' />
        </div>

        <div className='min-w-0'>
          <p className='text-sm font-medium text-muted-foreground'>{label}</p>
          <MoneyDisplay
            value={value}
            className={`mt-1 text-2xl font-bold ${toneClass}`}
          />
        </div>
      </div>
    </Card>
  );
}

function getResultCellClass(value: number) {
  if (value > 0) {
    return 'bg-income-muted text-income ring-income/20';
  }

  if (value < 0) {
    return 'bg-expense-muted text-expense ring-expense/20';
  }

  return 'bg-muted text-muted-foreground ring-border';
}

function SummaryTable({ rows }: { rows: FinanceOperationalSummaryDailyRow[] }) {
  return (
    <Card className='p-0'>
      <div className='flex items-center gap-2 border-b border-border px-5 py-4'>
        <CalendarDays
          aria-hidden='true'
          className='size-5 text-muted-foreground'
        />
        <h2 className='text-lg font-semibold text-foreground'>
          Resultado diário
        </h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-160 border-collapse text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted text-left text-sm text-muted-foreground'>
              <th className='w-24 px-5 py-3 font-semibold'>Dia</th>
              <th className='px-5 py-3 font-semibold'>Receita</th>
              <th className='px-5 py-3 font-semibold'>Despesa</th>
              <th className='px-5 py-3 font-semibold'>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.date}
                className='border-b border-border transition-colors last:border-b-0 hover:bg-muted/70'
              >
                <td className='px-5 py-3 font-medium text-muted-foreground'>
                  {String(row.day).padStart(2, '0')}
                </td>
                <td className='px-5 py-3 font-semibold text-income'>
                  {formatMoney(row.totalIncome)}
                </td>
                <td className='px-5 py-3 font-semibold text-expense'>
                  {formatMoney(row.totalExpense)}
                </td>
                <td className='px-5 py-3 font-semibold'>
                  <span
                    className={`inline-flex min-w-28 justify-center rounded-full px-3 py-1 ring-1 ${getResultCellClass(
                      row.result,
                    )}`}
                  >
                    {formatMoney(row.result)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

type SummaryFilterFormProps = {
  filters: FinanceOperationalSummaryFilters;
  isLoading: boolean;
  onApplyFilters: (filters: FinanceOperationalSummaryFilters) => Promise<void>;
};

function SummaryFilterForm({
  filters,
  isLoading,
  onApplyFilters,
}: SummaryFilterFormProps) {
  const [monthValue, setMonthValue] = useState(() =>
    toMonthInputValue(filters),
  );

  async function handleApplyFilters() {
    await onApplyFilters(parseMonthInputValue(monthValue));
  }

  function handleMonthChange(value: string) {
    if (!value) {
      return;
    }

    setMonthValue(value);
  }

  function preventManualMonthEdit(
    event:
      | ClipboardEvent<HTMLInputElement>
      | DragEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement>,
  ) {
    if ('key' in event && event.key === 'Tab') {
      return;
    }

    event.preventDefault();
  }

  return (
    <Card className='p-5'>
      <div className='grid gap-4 lg:grid-cols-[minmax(280px,0.45fr)_1fr_auto] lg:items-end'>
        <Input
          id='finance-summary-month'
          name='month'
          label='Mês'
          type='month'
          value={monthValue}
          aria-readonly='true'
          onChange={(event) => handleMonthChange(event.target.value)}
          onDrop={preventManualMonthEdit}
          onKeyDown={preventManualMonthEdit}
          onPaste={preventManualMonthEdit}
        />

        <div className='hidden lg:block' />

        <Button
          type='button'
          onClick={handleApplyFilters}
          disabled={isLoading}
          variant='custom'
          className='h-12 w-full bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90 lg:w-auto'
        >
          <Funnel aria-hidden='true' className='size-4' />
          {isLoading ? 'Carregando...' : 'Aplicar filtros'}
        </Button>
      </div>
    </Card>
  );
}

type FinanceSummaryPageContentProps = {
  initialMonthlySummary?: MonthlySummaryUi | null;
  initialDailyRows?: FinanceOperationalSummaryDailyRow[];
  initialError?: string | null;
  initialFilters?: FinanceOperationalSummaryFilters;
};

export function FinanceSummaryPageContent({
  initialMonthlySummary,
  initialDailyRows,
  initialError,
  initialFilters,
}: FinanceSummaryPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => getOperationalSummaryFiltersFromUrlSearchParams(searchParams),
    [searchParams],
  );

  const hookInitialParams = useMemo(
    () => ({
      ...urlFilters,
      ...(initialFilters && areFiltersEqual(initialFilters, urlFilters)
        ? {
            initialMonthlySummary: initialMonthlySummary ?? null,
            initialDailyRows: initialDailyRows ?? [],
            initialError: initialError ?? null,
          }
        : {}),
    }),
    [
      initialDailyRows,
      initialError,
      initialFilters,
      initialMonthlySummary,
      urlFilters,
    ],
  );

  const {
    filters,
    monthlySummary,
    dailyRows,
    isLoading,
    error,
    applyFilters,
    refresh,
  } = useFinanceOperationalSummary(hookInitialParams);

  const handleApplyFilters = useCallback(
    async (nextFilters: FinanceOperationalSummaryFilters) => {
      router.push(toFinanceSummaryUrl(nextFilters));
      await applyFilters(nextFilters);
    },
    [applyFilters, router],
  );

  useEffect(() => {
    if (areFiltersEqual(filters, urlFilters)) {
      return;
    }

    void applyFilters(urlFilters);
  }, [applyFilters, filters, urlFilters]);

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <PageTitle
        title='Resumo operacional'
        description='Acompanhe o resultado diário consolidado do mês selecionado.'
      />

      <SummaryFilterForm
        key={toMonthInputValue(filters)}
        filters={filters}
        isLoading={isLoading}
        onApplyFilters={handleApplyFilters}
      />

      {error && <LoadErrorState message={error} onRetry={refresh} />}

      {isLoading && (
        <div className='space-y-6'>
          <FinanceSummaryCardsSkeleton />
          <FinanceSummaryTableSkeleton rowCount={5} />
        </div>
      )}

      {!isLoading && !error && (
        <div className='space-y-6'>
          <section className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            <SummaryCard
              label='Receitas do mês'
              value={monthlySummary?.totalIncome ?? 0}
              tone='income'
            />
            <SummaryCard
              label='Despesas do mês'
              value={monthlySummary?.totalExpense ?? 0}
              tone='expense'
            />
            <SummaryCard
              label='Resultado operacional'
              value={monthlySummary?.result ?? 0}
              tone='result'
              className='lg:col-span-2 xl:col-span-1'
            />
          </section>

          <SummaryTable rows={dailyRows} />
        </div>
      )}
    </div>
  );
}
