'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
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

import { useCategoryExpensesChart } from '../hooks/use-category-expenses-chart';
import { ReportsPeriodMonths } from '../utils/reports-period';

type CategoryExpensesChartProps = {
  months: ReportsPeriodMonths;
};

export function CategoryExpensesChart({ months }: CategoryExpensesChartProps) {
  const { data, isLoading, error, refresh } = useCategoryExpensesChart(months);

  return (
    <Card>
      <h2 className='text-base font-semibold text-foreground'>
        Gastos por categoria
      </h2>

      {isLoading && <Skeleton className='mt-4 h-72 w-full' />}

      {!isLoading && error && (
        <div className='mt-4'>
          <LoadErrorState message={error} onRetry={refresh} />
        </div>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className='mt-4'>
          <EmptyState description='Nenhuma despesa registrada no período selecionado.' />
        </div>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className='mt-4 h-72 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              layout='vertical'
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} />
              <XAxis
                type='number'
                tickFormatter={(value: number) => formatMoney(value)}
              />
              <YAxis
                type='category'
                dataKey='categoryName'
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar
                dataKey='total'
                fill='var(--expense)'
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
