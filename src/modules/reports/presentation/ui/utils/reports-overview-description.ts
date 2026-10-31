import { roundToCents } from '@/shared/domain/money/round-to-cents';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import type { CategoryExpenseChartDatum } from '../hooks/use-category-expenses-chart';
import type { DebtsPaidChartDatum } from '../hooks/use-debts-paid-chart';
import type { IncomeExpenseEvolutionChartDatum } from '../hooks/use-income-expense-evolution-chart';

// Text alternatives of the overview charts for screen readers; the values
// behind each bar live in the "Ver dados em tabela" table.

function sum(values: number[]): number {
  return roundToCents(values.reduce((total, value) => total + value, 0));
}

function periodOf(items: { monthLabel: string }[]): string {
  return `de ${items[0]?.monthLabel ?? ''} a ${items[items.length - 1]?.monthLabel ?? ''}`;
}

export function describeIncomeExpenseChart(data: IncomeExpenseEvolutionChartDatum[]): string {
  const income = sum(data.map((item) => item.totalIncome));
  const expense = sum(data.map((item) => item.totalExpense));

  return `Gráfico de barras de receita e despesa por mês, ${periodOf(data)}. Receita no período: ${formatMoney(income)}. Despesa no período: ${formatMoney(expense)}. Resultado: ${formatMoney(roundToCents(income - expense))}.`;
}

export function describeCategoryExpensesChart(data: CategoryExpenseChartDatum[]): string {
  const total = sum(data.map((item) => item.total));
  const largest = data.reduce<CategoryExpenseChartDatum | null>(
    (current, item) => (!current || item.total > current.total ? item : current),
    null,
  );
  const count = `${data.length} ${data.length === 1 ? 'categoria' : 'categorias'}`;
  const largestText = largest
    ? ` Maior gasto: ${largest.categoryName}, ${formatMoney(largest.total)}.`
    : '';

  return `Gráfico de barras dos gastos por categoria no período: ${formatMoney(total)} em ${count}.${largestText}`;
}

export function describeDebtsPaidChart(data: DebtsPaidChartDatum[]): string {
  const total = sum(data.map((item) => item.total));
  const largest = data.reduce<DebtsPaidChartDatum | null>(
    (current, item) => (!current || item.total > current.total ? item : current),
    null,
  );
  const largestText = largest
    ? ` Mês com mais pagamentos: ${largest.monthLabel}, ${formatMoney(largest.total)}.`
    : '';

  return `Gráfico de barras do valor pago em dívidas por mês, ${periodOf(data)}. Total pago no período: ${formatMoney(total)}.${largestText}`;
}
