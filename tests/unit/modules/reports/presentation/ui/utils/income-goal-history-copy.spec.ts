import { describeIncomeGoalHistoryChart } from '@/modules/reports/presentation/ui/utils/income-goal-history-copy';
import { buildIncomeGoalHistory } from '@/modules/reports/presentation/ui/utils/income-goal-history';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

const history = buildIncomeGoalHistory({
  summaries: [
    { year: 2026, month: 8, totalIncome: 3000, totalExpense: 0, result: 3000 },
    { year: 2026, month: 9, totalIncome: 1000, totalExpense: 0, result: 1000 },
    { year: 2026, month: 10, totalIncome: 200, totalExpense: 0, result: 200 },
  ],
  monthKeys: ['2026-08', '2026-09', '2026-10'],
  measure: 'revenue',
  target: 2000,
  currentMonthKey: '2026-10',
});

describe('describeIncomeGoalHistoryChart', () => {
  it('should describe the period, the goal and how many months reached it', () => {
    expect(describeIncomeGoalHistoryChart('revenue', history, 2000)).toBe(
      `Gráfico de barras do faturamento mensal, de ago/26 a out/26. Meta de ${formatMoney(2000)} por mês. Bateu a meta em 1 de 2 meses fechados.`,
    );
  });

  it('should say when there is no goal', () => {
    expect(describeIncomeGoalHistoryChart('profit', { ...history, reached: null }, null)).toBe(
      'Gráfico de barras do lucro mensal, de ago/26 a out/26. Sem meta definida.',
    );
  });
});
