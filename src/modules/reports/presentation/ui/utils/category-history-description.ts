import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { CategoryHistoryMonth } from './category-history';

// Text alternative of the month-by-month chart for screen readers; the
// per-month values live in the "Ver dados em tabela" table.
export function describeCategoryHistoryChart(
  categoryName: string,
  months: CategoryHistoryMonth[],
  monthlyLimit: number | null,
): string {
  const first = months[0]?.label ?? '';
  const last = months[months.length - 1]?.label ?? '';
  const goal =
    monthlyLimit === null
      ? 'Sem meta definida.'
      : `Meta de ${formatMoney(monthlyLimit)} por mês.`;

  return `Gráfico de barras do gasto mensal de ${categoryName}, de ${first} a ${last}. ${goal}`;
}
