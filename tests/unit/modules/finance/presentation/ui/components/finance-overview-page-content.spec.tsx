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
    expect(screen.queryByText('Em breve')).not.toBeInTheDocument();
  });

  it('should render links to available finance sections', () => {
    render(<FinanceOverviewPageContent />);

    const links = screen.getAllByRole('link', { name: 'Acessar' });

    expect(links[0]).toHaveAttribute('href', '/finance/incomes');
    expect(links[1]).toHaveAttribute('href', '/finance/expenses');
    expect(links[2]).toHaveAttribute('href', '/finance/history');
    expect(links[3]).toHaveAttribute('href', '/finance/summary');
  });
});
