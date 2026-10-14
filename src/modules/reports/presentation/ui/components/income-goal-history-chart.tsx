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

import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import {
  describeIncomeGoalHistoryChart,
  INCOME_GOAL_HISTORY_COPY,
} from '../utils/income-goal-history-copy';
import {
  IncomeGoalHistory,
  IncomeGoalHistoryMonth,
  IncomeGoalMonthStatus,
} from '../utils/income-goal-history';
import { getHistoryChartScale } from '../utils/history-chart-scale';
import { IncomeGoalHistoryTable } from './income-goal-history-table';

// Validated with the dataviz skill (light and dark). The status is also in
// the tooltip and the table, so color is never the only cue.
const FILL: Record<Exclude<IncomeGoalMonthStatus, 'CURRENT'>, string> = {
  REACHED: 'var(--chart-bar-reached)',
  BELOW: 'var(--chart-bar)',
  NONE: 'var(--chart-bar)',
  NEGATIVE: 'var(--chart-bar-over-limit)',
};

const TOOLTIP_SUFFIX: Record<IncomeGoalMonthStatus, string> = {
  CURRENT: '',
  REACHED: ' (bateu a meta)',
  BELOW: ' (abaixo da meta)',
  NEGATIVE: ' (no vermelho)',
  NONE: '',
};

// The partial current month keeps the color it would have, lighter.
function fillOf(month: IncomeGoalHistoryMonth, target: number | null): string {
  if (month.status !== 'CURRENT') {
    return FILL[month.status];
  }

  if (month.value < 0) return FILL.NEGATIVE;
  if (target !== null && month.value >= target) return FILL.REACHED;
  return FILL.BELOW;
}

type IncomeGoalHistoryChartProps = {
  measure: IncomeGoalKind;
  history: IncomeGoalHistory;
  target: number | null;
};

export function IncomeGoalHistoryChart({ measure, history, target }: IncomeGoalHistoryChartProps) {
  const copy = INCOME_GOAL_HISTORY_COPY[measure];
  const hasNegative = history.months.some((month) => month.value < 0);
  const scale = getHistoryChartScale(
    history.months.map((month) => month.value),
    target,
  );
  const data = history.months.map((month) => ({
    ...month,
    axisLabel: month.isCurrent ? `${month.label}*` : month.label,
  }));

  return (
    <figure>
      <figcaption className='sr-only'>
        {describeIncomeGoalHistoryChart(measure, history, target)}
      </figcaption>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            {/* Skip month labels only when they do not fit (12 months on a
                phone); every month is still listed in the table below. */}
            <XAxis
              dataKey='axisLabel'
              tick={{ fontSize: 12 }}
              interval='preserveStartEnd'
              minTickGap={8}
            />
            <YAxis
              width={88}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => formatMoney(value)}
              // Round ticks that keep the goal line and negative profit
              // bars inside the chart.
              domain={scale.domain}
              ticks={scale.ticks}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              labelFormatter={(_, payload) => {
                const month = payload?.[0]?.payload as IncomeGoalHistoryMonth | undefined;

                return month?.isCurrent ? `${month.label} (até hoje)` : (month?.label ?? '');
              }}
              formatter={(value, _name, item) => {
                const month = item.payload as IncomeGoalHistoryMonth;

                return [formatMoney(Number(value)), `${copy.valueLabel}${TOOLTIP_SUFFIX[month.status]}`];
              }}
            />
            {hasNegative && <ReferenceLine y={0} stroke='var(--border)' />}
            <Bar dataKey='value' radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((month) => (
                <Cell
                  key={month.key}
                  fill={fillOf(month, target)}
                  fillOpacity={month.isCurrent ? 0.45 : 1}
                />
              ))}
            </Bar>
            {target !== null && (
              <ReferenceLine
                y={target}
                stroke='var(--muted-foreground)'
                strokeDasharray='6 4'
                strokeWidth={2}
                label={{
                  value: `Meta ${formatMoney(target)}`,
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

      <IncomeGoalHistoryTable measure={measure} months={history.months} hasTarget={target !== null} />
    </figure>
  );
}
