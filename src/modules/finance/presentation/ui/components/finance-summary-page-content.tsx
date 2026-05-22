'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClipboardEvent, DragEvent, KeyboardEvent } from 'react';
import {
  CalendarDays,
  ChartNoAxesCombined,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
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
};

function SummaryCard({ label, value, tone = 'default' }: SummaryCardProps) {
  const Icon =
    tone === 'income'
      ? TrendingUp
      : tone === 'expense'
        ? TrendingDown
        : ChartNoAxesCombined;

  const toneClass =
    tone === 'income'
      ? 'text-emerald-700'
      : tone === 'expense'
        ? 'text-red-700'
        : tone === 'result'
          ? value >= 0
            ? 'text-emerald-700'
            : 'text-red-700'
          : 'text-slate-950';

  return (
    <Card>
      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <Icon
            aria-hidden='true'
            className={`size-4 ${
              tone === 'income'
                ? 'text-emerald-600'
                : tone === 'expense'
                  ? 'text-red-600'
                  : 'text-slate-600'
            }`}
          />
          <p>{label}</p>
        </div>
        <MoneyDisplay value={value} className={`text-2xl ${toneClass}`} />
      </div>
    </Card>
  );
}

function getResultCellClass(value: number) {
  if (value > 0) {
    return 'bg-emerald-100 text-emerald-950';
  }

  if (value < 0) {
    return 'bg-red-100 text-red-950';
  }

  return 'bg-slate-50 text-slate-700';
}

function SummaryTable({ rows }: { rows: FinanceOperationalSummaryDailyRow[] }) {
  return (
    <Card>
      <div className='overflow-x-auto rounded-lg border border-slate-100'>
        <table className='w-full min-w-[640px] border-collapse text-sm'>
          <thead>
            <tr className='border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500'>
              <th className='w-20 px-3 py-3 font-semibold'>Dia</th>
              <th className='px-3 py-3 font-semibold'>Receita</th>
              <th className='px-3 py-3 font-semibold'>Despesa</th>
              <th className='px-3 py-3 font-semibold'>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className='border-b border-slate-100'>
                <td className='px-3 py-3 font-medium text-slate-500'>
                  {String(row.day).padStart(2, '0')}
                </td>
                <td className='px-3 py-3 font-semibold text-emerald-700'>
                  {formatMoney(row.totalIncome)}
                </td>
                <td className='px-3 py-3 font-semibold text-red-700'>
                  {formatMoney(row.totalExpense)}
                </td>
                <td
                  className={`px-3 py-3 font-semibold ${getResultCellClass(
                    row.result,
                  )}`}
                >
                  {formatMoney(row.result)}
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
    <Card>
      <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-end'>
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

        <Button
          type='button'
          onClick={handleApplyFilters}
          disabled={isLoading}
          className='w-full md:w-auto'
        >
          <Search aria-hidden='true' className='size-4' />
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

  const { filters, monthlySummary, dailyRows, isLoading, error, applyFilters } =
    useFinanceOperationalSummary(hookInitialParams);

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

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {isLoading && (
        <p className='text-sm text-slate-500'>Carregando resumo financeiro...</p>
      )}

      {!isLoading && !error && (
        <div className='space-y-6'>
          <section className='grid gap-4 md:grid-cols-3'>
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
            />
          </section>

          <section className='space-y-3'>
            <div className='flex items-center gap-2'>
              <CalendarDays aria-hidden='true' className='size-5 text-slate-600' />
              <h2 className='text-lg font-semibold text-slate-900'>
                Resultado diário
              </h2>
            </div>
            <SummaryTable rows={dailyRows} />
          </section>
        </div>
      )}
    </div>
  );
}
