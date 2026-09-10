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

import { useDebtsPaidChart } from '../hooks/use-debts-paid-chart';
import { ReportsPeriodMonths } from '../utils/reports-period';

type DebtsPaidChartProps = {
  months: ReportsPeriodMonths;
};

export function DebtsPaidChart({ months }: DebtsPaidChartProps) {
  const { data, isLoading, error, refresh } = useDebtsPaidChart(months);
  const hasData = data.some((item) => item.total > 0);

  return (
    <Card>
      <h2 className='text-base font-semibold text-foreground'>
        Dívidas pagas
      </h2>

      {isLoading && <Skeleton className='mt-4 h-72 w-full' />}

      {!isLoading && error && (
        <div className='mt-4'>
          <LoadErrorState message={error} onRetry={refresh} />
        </div>
      )}

      {!isLoading && !error && !hasData && (
        <div className='mt-4'>
          <EmptyState description='Nenhuma dívida paga no período selecionado.' />
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
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar
                dataKey='total'
                name='Dívidas pagas'
                fill='var(--destructive)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
