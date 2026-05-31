import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { render, screen } from '@testing-library/react';

describe('BalanceSummaryDashboard', () => {
  it('should render error state when server loading returns error', () => {
    render(<BalanceSummaryDashboard error='Não autenticado' />);

    expect(
      screen.getByText('Não foi possível carregar o dashboard.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Não autenticado')).toBeInTheDocument();
  });

  it('should render summary cards when server loading returns data', () => {
    render(
      <BalanceSummaryDashboard
        summary={{
        wallet: {
          bankBalance: 1500,
          cashBalance: 200,
          receivableBalance: 450,
          walletTotal: 2150,
        },
        debts: {
          pendingDebts: 300,
        },
        finalBalance: 1850,
        }}
      />,
    );

    expect(screen.getByText('Valor Total da Carteira')).toBeInTheDocument();
    expect(screen.getByText('Dívidas Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Saldo Final')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Banco')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Dinheiro')).toBeInTheDocument();
    expect(screen.getByText('Valores a Receber')).toBeInTheDocument();
  });

  it('should render empty state when server loading returns no data and no error', () => {
    render(<BalanceSummaryDashboard />);

    expect(
      screen.getByText('Nenhum resumo financeiro encontrado.'),
    ).toBeInTheDocument();
  });
});
