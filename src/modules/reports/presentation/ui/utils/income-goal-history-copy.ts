import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { IncomeGoalHistory } from './income-goal-history';

export const INCOME_GOAL_HISTORY_COPY: Record<
  IncomeGoalKind,
  { title: string; description: string; chartTitle: string; valueLabel: string; emptyLabel: string }
> = {
  revenue: {
    title: 'Faturamento',
    description: 'Quanto entrou por mês.',
    chartTitle: 'Faturamento por mês',
    valueLabel: 'Faturamento',
    emptyLabel: 'faturamento',
  },
  profit: {
    title: 'Lucro',
    description: 'Receita menos despesa por mês, incluindo dívidas pagas.',
    chartTitle: 'Lucro por mês',
    valueLabel: 'Lucro',
    emptyLabel: 'lucro',
  },
};

// Text alternative of the chart for screen readers; per-month values and
// statuses live in the "Ver dados em tabela" table.
export function describeIncomeGoalHistoryChart(
  measure: IncomeGoalKind,
  history: IncomeGoalHistory,
  target: number | null,
): string {
  const first = history.months[0]?.label ?? '';
  const last = history.months[history.months.length - 1]?.label ?? '';
  const base = `Gráfico de barras do ${INCOME_GOAL_HISTORY_COPY[measure].emptyLabel} mensal, de ${first} a ${last}.`;

  if (target === null || !history.reached) {
    return `${base} Sem meta definida.`;
  }

  return `${base} Meta de ${formatMoney(target)} por mês. Bateu a meta em ${history.reached.count} de ${history.reached.closedMonths} meses fechados.`;
}
