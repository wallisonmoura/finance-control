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
  { targetUnavailable = false }: { targetUnavailable?: boolean } = {},
): string {
  const first = history.months[0]?.label ?? '';
  const last = history.months[history.months.length - 1]?.label ?? '';
  const base = `Gráfico de barras do ${INCOME_GOAL_HISTORY_COPY[measure].emptyLabel} mensal, de ${first} a ${last}.`;

  // A goal that failed to load may exist, so "no goal" would be false.
  const goal = targetUnavailable
    ? 'Meta indisponível no momento.'
    : target === null || !history.reached
      ? 'Sem meta definida.'
      : `Meta de ${formatMoney(target)} por mês. Bateu a meta em ${history.reached.count} de ${history.reached.closedMonths} meses fechados.`;
  const best = history.bestMonth
    ? ` Melhor mês: ${history.bestMonth.label}, ${formatMoney(history.bestMonth.value)}.`
    : '';
  const red =
    history.negative.count > 0
      ? ` Fechou no vermelho em ${history.negative.count} de ${history.negative.closedMonths} meses fechados.`
      : '';

  return `${base} ${goal}${best}${red}`;
}

// The average uses closed months only, but the total also counts the current
// month so far: say so under the total so both numbers read consistently.
export function describePeriodTotalNote(history: IncomeGoalHistory): string | null {
  const current = history.months.find((month) => month.isCurrent);

  if (!current) {
    return null;
  }

  const [year, month] = current.key.split('-').map(Number);
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );

  return `Inclui ${name} até hoje.`;
}
