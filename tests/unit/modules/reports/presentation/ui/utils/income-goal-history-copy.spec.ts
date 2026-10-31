import {
  describeIncomeGoalHistoryChart,
  describePeriodTotalNote,
} from '@/modules/reports/presentation/ui/utils/income-goal-history-copy';
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
      `Gráfico de barras do faturamento mensal, de ago/26 a out/26. Meta de ${formatMoney(2000)} por mês. Bateu a meta em 1 de 2 meses fechados. Melhor mês: ago/26, ${formatMoney(3000)}.`,
    );
  });

  // A goal that failed to load may exist: "no goal" would be a false statement.
  it('should say the goal is unavailable when it failed to load', () => {
    expect(
      describeIncomeGoalHistoryChart('profit', { ...history, reached: null }, null, {
        targetUnavailable: true,
      }),
    ).toBe(
      `Gráfico de barras do lucro mensal, de ago/26 a out/26. Meta indisponível no momento. Melhor mês: ago/26, ${formatMoney(3000)}.`,
    );
  });

  it('should say when there is no goal', () => {
    expect(describeIncomeGoalHistoryChart('profit', { ...history, reached: null }, null)).toBe(
      `Gráfico de barras do lucro mensal, de ago/26 a out/26. Sem meta definida. Melhor mês: ago/26, ${formatMoney(3000)}.`,
    );
  });

  it('should mention the months in the red for profit', () => {
    const profit = buildIncomeGoalHistory({
      summaries: [
        { year: 2026, month: 8, totalIncome: 100, totalExpense: 400, result: -300 },
        { year: 2026, month: 9, totalIncome: 0, totalExpense: 0, result: 0 },
        { year: 2026, month: 10, totalIncome: 0, totalExpense: 0, result: 0 },
      ],
      monthKeys: ['2026-08', '2026-09', '2026-10'],
      measure: 'profit',
      target: null,
      currentMonthKey: '2026-10',
    });

    expect(describeIncomeGoalHistoryChart('profit', profit, null)).toBe(
      'Gráfico de barras do lucro mensal, de ago/26 a out/26. Sem meta definida. Fechou no vermelho em 1 de 2 meses fechados.',
    );
  });
});

describe('describePeriodTotalNote', () => {
  it('should say the total includes the current month so far', () => {
    expect(describePeriodTotalNote(history)).toBe('Inclui outubro até hoje.');
  });

  it('should say nothing when the window has no current month', () => {
    const closedOnly = {
      ...history,
      months: history.months.map((month) => ({ ...month, isCurrent: false })),
    };

    expect(describePeriodTotalNote(closedOnly)).toBeNull();
  });
});
