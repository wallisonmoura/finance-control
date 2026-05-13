import { render, screen } from '@testing-library/react';

import { FinanceHistorySummary } from '@/modules/finance/presentation/ui/components/finance-history-summary';

describe('FinanceHistorySummary', () => {
  it('should render period summary values', () => {
    render(
      <FinanceHistorySummary
        totalIncome={720}
        totalExpense={110}
        balance={610}
      />,
    );

    expect(screen.getByText('Receitas do período')).toBeInTheDocument();
    expect(screen.getByText('Despesas do período')).toBeInTheDocument();
    expect(screen.getByText('Resultado do período')).toBeInTheDocument();

    expect(screen.getByText('R$ 720,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 110,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 610,00')).toBeInTheDocument();
  });

  it('should render negative balance', () => {
    render(
      <FinanceHistorySummary
        totalIncome={0}
        totalExpense={110}
        balance={-110}
      />,
    );

    expect(screen.getByText('-R$ 110,00')).toBeInTheDocument();
  });
});
