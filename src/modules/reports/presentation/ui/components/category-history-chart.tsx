'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { CategoryHistoryMonth } from '../utils/category-history';
import { describeCategoryHistoryChart } from '../utils/category-history-description';
import { CategoryHistoryTable } from './category-history-table';

type CategoryHistoryChartProps = {
  categoryName: string;
  months: CategoryHistoryMonth[];
  monthlyLimit: number | null;
};

// Colors validated with the dataviz validator (see --chart-bar in
// globals.css). Over-limit months also say so in the tooltip and in the
// overrun sentence below the chart, so color is never the only cue.
function barFill(month: CategoryHistoryMonth): string {
  return month.overLimit ? 'var(--chart-bar-over-limit)' : 'var(--chart-bar)';
}

export function CategoryHistoryChart({
  categoryName,
  months,
  monthlyLimit,
}: CategoryHistoryChartProps) {
  const data = months.map((month) => ({
    ...month,
    // The partial current month is marked on the axis and explained below.
    axisLabel: month.isCurrent ? `${month.label}*` : month.label,
  }));

  return (
    <figure>
      <figcaption className='sr-only'>
        {describeCategoryHistoryChart(categoryName, months, monthlyLimit)}
      </figcaption>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis dataKey='axisLabel' tick={{ fontSize: 12 }} interval={0} />
            <YAxis
              width={88}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => formatMoney(value)}
              // Keep the goal line inside the chart even when every month
              // is below it.
              domain={[0, (dataMax: number) => Math.max(dataMax, monthlyLimit ?? 0) * 1.1]}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              labelFormatter={(_, payload) => {
                const month = payload?.[0]?.payload as CategoryHistoryMonth | undefined;

                return month?.isCurrent ? `${month.label} (até hoje)` : (month?.label ?? '');
              }}
              formatter={(value, _name, item) => {
                const month = item.payload as CategoryHistoryMonth;

                return [
                  formatMoney(Number(value)),
                  month.overLimit ? 'Gasto (acima da meta)' : 'Gasto',
                ];
              }}
            />
            <Bar dataKey='total' radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((month) => (
                <Cell
                  key={month.key}
                  fill={barFill(month)}
                  fillOpacity={month.isCurrent ? 0.45 : 1}
                />
              ))}
            </Bar>
            {monthlyLimit !== null && (
              <ReferenceLine
                y={monthlyLimit}
                stroke='var(--muted-foreground)'
                strokeDasharray='6 4'
                strokeWidth={2}
                label={{
                  value: `Meta ${formatMoney(monthlyLimit)}`,
                  position: 'insideTopRight',
                  fill: 'var(--muted-foreground)',
                  fontSize: 12,
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className='mt-2 text-xs text-muted-foreground'>* Mês em andamento, até hoje.</p>

      <CategoryHistoryTable
        categoryName={categoryName}
        months={months}
        hasLimit={monthlyLimit !== null}
      />
    </figure>
  );
}
