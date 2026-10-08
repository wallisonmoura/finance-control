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
import { CategoryAxisTick } from './category-axis-tick';

type CategoryExpensesChartProps = {
  months: ReportsPeriodMonths;
};

export function CategoryExpensesChart({ months }: CategoryExpensesChartProps) {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useCategoryExpensesChart(months);

  function openCategoryHistory(categoryId: string) {
    router.push(getCategoryHistoryHref(categoryId, months));
  }

  function openCategoryHistoryByName(categoryName: string) {
    const category = data.find((item) => item.categoryName === categoryName);

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
        <div
          className='mt-4 w-full'
          style={{ height: getCategoryChartHeight(data.length) }}
        >
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
                tick={<CategoryAxisTick onSelect={openCategoryHistoryByName} />}
                interval={0}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar
                dataKey='total'
                fill='var(--expense)'
                radius={[0, 4, 4, 0]}
                barSize={16}
                cursor='pointer'
                onClick={(entry) =>
                  openCategoryHistory((entry as unknown as CategoryExpenseChartDatum).categoryId)
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
