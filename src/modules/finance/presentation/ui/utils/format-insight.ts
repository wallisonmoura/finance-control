import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { MonthlyInsightUi } from '../types/finance-ui.types';

export type InsightTone = 'income' | 'expense' | 'neutral';

type InsightMonthUi = { year: number; month: number };

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const UNKNOWN_CATEGORY_LABEL = 'Sem categoria';

// Category names can be plural ("Parcelas"), so sentences keep a singular
// subject ("Gasto com …", "Sua maior despesa é …") instead of conjugating
// the verb against the category name.
function categoryLabel(categoryName: string | null): string {
  return categoryName ?? UNKNOWN_CATEGORY_LABEL;
}

function describeChange(changePercent: number, monthName: string): string {
  if (changePercent === 0) {
    return `o mesmo que no mesmo período de ${monthName}`;
  }

  const direction = changePercent > 0 ? 'a mais' : 'a menos';

  return `${Math.abs(changePercent)}% ${direction} que no mesmo período de ${monthName}`;
}

function describeAverageWindow(monthsCount: number): string {
  return monthsCount === 1 ? 'no último mês' : `nos últimos ${monthsCount} meses`;
}

export function formatInsight(
  insight: MonthlyInsightUi,
  comparisonMonth: InsightMonthUi,
): string {
  const monthName = MONTH_NAMES[comparisonMonth.month - 1];

  switch (insight.kind) {
    case 'EXPENSE_TOTAL_COMPARISON':
      return `Você gastou ${formatMoney(insight.current)} até agora, ${describeChange(insight.changePercent, monthName)}.`;
    case 'TOP_EXPENSE_CATEGORY':
      return `Sua maior despesa é ${categoryLabel(insight.categoryName)}: ${formatMoney(insight.amount)} (${insight.sharePercent}% do total).`;
    case 'EXPENSE_CATEGORY_RISE':
      if (insight.changePercent === null) {
        return `${categoryLabel(insight.categoryName)}: ${formatMoney(insight.current)}, sem gastos no mesmo período de ${monthName}.`;
      }

      return `Gasto com ${categoryLabel(insight.categoryName)} subiu ${insight.changePercent}% (${formatMoney(insight.previous)} → ${formatMoney(insight.current)}) em relação ao mesmo período de ${monthName}.`;
    case 'EXPENSE_CATEGORY_DROP':
      return `Gasto com ${categoryLabel(insight.categoryName)} caiu ${Math.abs(insight.changePercent)}% (${formatMoney(insight.previous)} → ${formatMoney(insight.current)}). Boa!`;
    case 'INCOME_TOTAL_COMPARISON':
      return `Você ganhou ${formatMoney(insight.current)} até agora, ${describeChange(insight.changePercent, monthName)}.`;
    case 'INCOME_VS_AVERAGE': {
      const window = describeAverageWindow(insight.monthsCount);

      if (insight.current < insight.average) {
        return `Sua média de ganho ${window} é ${formatMoney(insight.average)}. Faltam ${formatMoney(insight.average - insight.current)} para alcançá-la.`;
      }

      if (insight.current === insight.average) {
        return `Você alcançou sua média de ganho ${window} (${formatMoney(insight.average)}).`;
      }

      return `Você já passou sua média de ganho ${window} (${formatMoney(insight.average)}) em ${formatMoney(insight.current - insight.average)}.`;
    }
    case 'MONTH_RESULT': {
      const sign = insight.result < 0 ? '−' : '+';

      return `Receitas − despesas até agora: ${sign} ${formatMoney(Math.abs(insight.result))}.`;
    }
  }
}

export function getInsightTone(insight: MonthlyInsightUi): InsightTone {
  switch (insight.kind) {
    case 'EXPENSE_CATEGORY_RISE':
      return 'expense';
    case 'EXPENSE_CATEGORY_DROP':
      return 'income';
    case 'EXPENSE_TOTAL_COMPARISON':
      if (insight.changePercent === 0) {
        return 'neutral';
      }

      return insight.changePercent > 0 ? 'expense' : 'income';
    case 'MONTH_RESULT':
      return insight.result < 0 ? 'expense' : 'income';
    default:
      return 'neutral';
  }
}
