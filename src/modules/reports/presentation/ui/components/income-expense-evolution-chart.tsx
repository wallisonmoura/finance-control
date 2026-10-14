'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { useIncomeExpenseEvolutionChart } from '../hooks/use-income-expense-evolution-chart';
import { getIncomeGoalHistoryHref } from '../utils/income-goal-history-links';
import { ReportsPeriodMonths } from '../utils/reports-period';
import { CHART_TOOLTIP_PROPS } from '../utils/chart-tooltip-style';

type IncomeExpenseEvolutionChartProps = {
  months: ReportsPeriodMonths;
};

export function IncomeExpenseEvolutionChart({
  months,
}: IncomeExpenseEvolutionChartProps) {
  const router = useRouter();
  const { data, isLoading, error, refresh } =
    useIncomeExpenseEvolutionChart(months);
  const hasData = data.some(
    (item) => item.totalIncome > 0 || item.totalExpense > 0,
  );

  return (
    <Card>
      <h2 className='text-base font-semibold text-foreground'>
        Receita × despesa por mês
      </h2>

      {isLoading && <Skeleton className='mt-4 h-72 w-full' />}

      {!isLoading && error && (
        <div className='mt-4'>
          <LoadErrorState message={error} onRetry={refresh} />
        </div>
      )}

      {!isLoading && !error && !hasData && (
        <div className='mt-4'>
          <EmptyState description='Nenhum lançamento registrado no período selecionado.' />
        </div>
      )}

      {!isLoading && !error && hasData && (
        <div className='mt-4 h-72 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='monthLabel' tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => formatMoney(value)}
                width={90}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                formatter={(value) => formatMoney(Number(value))}
              />
              <Legend />
              <Bar
                dataKey='totalIncome'
                name='Receita'
                fill='var(--income)'
                radius={[4, 4, 0, 0]}
                cursor='pointer'
                // Mouse shortcut; the links below are the keyboard path.
                onClick={() =>
                  router.push(getIncomeGoalHistoryHref('revenue', months))
                }
              />
              <Bar
                dataKey='totalExpense'
                name='Despesa'
                fill='var(--expense)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isLoading && !error && (
        <nav
          aria-label='Históricos de ganho'
          className='mt-3 flex flex-wrap gap-x-4 gap-y-1'
        >
          <Link
            href={getIncomeGoalHistoryHref('revenue', months)}
            className='text-sm font-semibold text-income hover:underline'
          >
            Histórico do faturamento
          </Link>
          <Link
            href={getIncomeGoalHistoryHref('profit', months)}
            className='text-sm font-semibold text-income hover:underline'
          >
            Histórico do lucro
          </Link>
        </nav>
      )}
    </Card>
  );
}
