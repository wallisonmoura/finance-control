'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { ReportsPeriodMonths } from '../utils/reports-period';

type IncomeExpenseEvolutionChartProps = {
  months: ReportsPeriodMonths;
};

export function IncomeExpenseEvolutionChart({
  months,
}: IncomeExpenseEvolutionChartProps) {
  const { data, isLoading, error, refresh } = useIncomeExpenseEvolutionChart(months);
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
            <LineChart
              data={data}
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='monthLabel' tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => formatMoney(value)}
                width={90}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Legend />
              <Line
                type='monotone'
                dataKey='totalIncome'
                name='Receita'
                stroke='var(--income)'
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type='monotone'
                dataKey='totalExpense'
                name='Despesa'
                stroke='var(--expense)'
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
