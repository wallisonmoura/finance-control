import { render, screen } from '@testing-library/react';

import { FinanceHistorySummary } from '@/modules/finance/presentation/ui/components/finance-history-summary';

describe('FinanceHistorySummary', () => {
  it('should render period summary values', () => {
    render(
      <FinanceHistorySummary
        totalIncome={720}
        totalExpense={110}
        balance={610}
        totalEntries={3}
      />,
    );

    expect(screen.getByText('Total de receitas')).toBeInTheDocument();
    expect(screen.getByText('Total de despesas')).toBeInTheDocument();
    expect(screen.getByText('Saldo no período')).toBeInTheDocument();
    expect(screen.getByText('Total de movimentações')).toBeInTheDocument();

    expect(screen.getByText('R$ 720,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 110,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 610,00')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('registros')).toBeInTheDocument();
  });

  it('should render negative balance', () => {
    render(
      <FinanceHistorySummary
        totalIncome={0}
        totalExpense={110}
        balance={-110}
        totalEntries={1}
      />,
    );

    expect(screen.getByText('-R$ 110,00')).toBeInTheDocument();
    expect(screen.getByText('registro')).toBeInTheDocument();
  });
});
