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
import { CHART_TOOLTIP_PROPS } from '../utils/chart-tooltip-style';
import { formatCompactMoney } from '../utils/format-compact-money';
import { ChartDataTable } from './chart-data-table';
import { describeDebtsPaidChart } from '../utils/reports-overview-description';

type DebtsPaidChartProps = {
  months: ReportsPeriodMonths;
};

export function DebtsPaidChart({ months }: DebtsPaidChartProps) {
  const { data, isLoading, error, refresh } = useDebtsPaidChart(months);
  const hasData = data.some((item) => item.total > 0);

  return (
    <Card>
      <h2 className='text-base font-semibold text-foreground'>Dívidas pagas</h2>

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
        <figure>
          <figcaption className='sr-only'>{describeDebtsPaidChart(data)}</figcaption>
          <div className='mt-4 h-72 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={data}
                margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='monthLabel' tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value: number) => formatCompactMoney(value)}
                  width={90}
                />
                <Tooltip
                  {...CHART_TOOLTIP_PROPS}
                  formatter={(value) => formatMoney(Number(value))}
                />
                <Bar
                  dataKey='total'
                  name='Dívidas pagas'
                  fill='var(--chart-expense)'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartDataTable
            caption='Valor pago em dívidas por mês'
            columns={[{ header: 'Mês' }, { header: 'Valor pago', align: 'right' }]}
            rows={data.map((item) => ({
              key: item.monthLabel,
              cells: [item.monthLabel, formatMoney(item.total)],
            }))}
          />
        </figure>
      )}
    </Card>
  );
}
