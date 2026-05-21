import { render, screen } from '@testing-library/react';

import { FinanceOverviewPageContent } from '@/modules/finance/presentation/ui/components/finance-overview-page-content';

describe('FinanceOverviewPageContent', () => {
  it('should render finance overview cards', () => {
    render(<FinanceOverviewPageContent />);

    expect(screen.getByText('Financeiro')).toBeInTheDocument();

    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('Resumo')).toBeInTheDocument();

    expect(screen.getAllByText('Acessar')).toHaveLength(4);
  });

  it('should render links to available finance sections', () => {
    render(<FinanceOverviewPageContent />);

    expect(
      screen.getByRole('link', { name: 'Acessar Receitas' }),
    ).toHaveAttribute('href', '/finance/incomes');
    expect(
      screen.getByRole('link', { name: 'Acessar Despesas' }),
    ).toHaveAttribute('href', '/finance/expenses');
    expect(
      screen.getByRole('link', { name: 'Acessar Histórico' }),
    ).toHaveAttribute('href', '/finance/history');
    expect(
      screen.getByRole('link', { name: 'Acessar Resumo' }),
    ).toHaveAttribute('href', '/finance/summary');
  });
});
