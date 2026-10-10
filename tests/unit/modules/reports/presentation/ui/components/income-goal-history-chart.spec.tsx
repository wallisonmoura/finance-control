import { render, screen } from '@testing-library/react';

import { IncomeGoalHistoryChart } from '@/modules/reports/presentation/ui/components/income-goal-history-chart';
import { buildIncomeGoalHistory } from '@/modules/reports/presentation/ui/utils/income-goal-history';

const history = buildIncomeGoalHistory({
  summaries: [
    { year: 2026, month: 9, totalIncome: 3000, totalExpense: 0, result: 3000 },
    { year: 2026, month: 10, totalIncome: 100, totalExpense: 0, result: 100 },
  ],
  monthKeys: ['2026-09', '2026-10'],
  measure: 'revenue',
  target: 2000,
  currentMonthKey: '2026-10',
});

describe('IncomeGoalHistoryChart', () => {
  it('should describe the chart for screen readers and explain the current month', () => {
    render(<IncomeGoalHistoryChart measure='revenue' history={history} target={2000} />);

    expect(
      screen.getByText(/Gráfico de barras do faturamento mensal, de set\/26 a out\/26/),
    ).toBeInTheDocument();
    expect(screen.getByText('* Mês em andamento, até hoje.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver dados em tabela' })).toBeInTheDocument();
  });
});
