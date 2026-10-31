'use client';

import { useRouter } from 'next/navigation';
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

import {
  CategoryExpenseChartDatum,
  useCategoryExpensesChart,
} from '../hooks/use-category-expenses-chart';
import { getCategoryHistoryHref } from '../utils/category-history-links';
import { getCategoryChartHeight } from '../utils/category-chart-height';
import { ReportsPeriodMonths } from '../utils/reports-period';
import { CHART_TOOLTIP_PROPS } from '../utils/chart-tooltip-style';
import { formatCompactMoney } from '../utils/format-compact-money';
import { getHistoryChartScale } from '../utils/history-chart-scale';
import { ChartDataTable } from './chart-data-table';
import { describeCategoryExpensesChart } from '../utils/reports-overview-description';
import { CategoryAxisTick } from './category-axis-tick';

type CategoryExpensesChartProps = {
  months: ReportsPeriodMonths;
};

export function CategoryExpensesChart({ months }: CategoryExpensesChartProps) {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useCategoryExpensesChart(months);
  const scale = getHistoryChartScale(
    data.map((item) => item.total),
    null,
  );

  function openCategoryHistory(categoryId: string) {
    router.push(getCategoryHistoryHref(categoryId, months));
  }

  // By position, not by name: names may repeat (e.g. "Sem categoria").
  function openCategoryHistoryAt(index: number) {
    const category = data[index];

    if (category) {
      openCategoryHistory(category.categoryId);
    }
  }

  return (
    <Card>
      <h2 className='text-base font-semibold text-foreground'>
        Gastos por categoria
      </h2>
      {!isLoading && !error && data.length > 0 && (
        <p className='mt-1 text-xs text-muted-foreground'>
          Clique numa categoria para ver o histórico.
        </p>
      )}

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
        <figure>
          <figcaption className='sr-only'>{describeCategoryExpensesChart(data)}</figcaption>
          <div
            className='mt-4 w-full'
            style={{ height: getCategoryChartHeight(data.length) }}
          >
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={data}
                layout='vertical'
                // Room on the right for the last tick label ("R$ 10 mil").
                margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                {/* Round, short ticks ("R$ 2,5 mil"); on a phone the ones that
                    do not fit are skipped. The tooltip keeps the exact value. */}
                <XAxis
                  type='number'
                  domain={scale.domain}
                  ticks={scale.ticks}
                  interval='preserveStartEnd'
                  minTickGap={8}
                  tickFormatter={(value: number) => formatCompactMoney(value)}
                />
                <YAxis
                  type='category'
                  dataKey='categoryName'
                  width={140}
                  tick={<CategoryAxisTick onSelect={openCategoryHistoryAt} />}
                  interval={0}
                />
                <Tooltip
                  {...CHART_TOOLTIP_PROPS}
                  formatter={(value) => formatMoney(Number(value))}
                />
                <Bar
                  dataKey='total'
                  fill='var(--chart-expense)'
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  cursor='pointer'
                  onClick={(entry) =>
                    openCategoryHistory(
                      (entry.payload as CategoryExpenseChartDatum).categoryId,
                    )
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartDataTable
            caption='Gastos por categoria no período'
            columns={[{ header: 'Categoria' }, { header: 'Gasto', align: 'right' }]}
            rows={data.map((item) => ({
              key: item.categoryId,
              cells: [item.categoryName, formatMoney(item.total)],
            }))}
          />
        </figure>
      )}
    </Card>
  );
}
