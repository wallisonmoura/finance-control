import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { getBalanceSummary } from '@/modules/balance/presentation/ui/services/balance-summary-api.service';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock(
  '@/modules/balance/presentation/ui/services/balance-summary-api.service',
  () => ({
    getBalanceSummary: jest.fn(),
  }),
);

const getBalanceSummaryMock = jest.mocked(getBalanceSummary);

describe('BalanceSummaryDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    getBalanceSummaryMock.mockImplementationOnce(
      () => new Promise(() => undefined),
    );

    render(<BalanceSummaryDashboard />);

    expect(
      screen.getByText('Carregando resumo financeiro...'),
    ).toBeInTheDocument();
  });

  it('should render error state when service returns error', async () => {
    getBalanceSummaryMock.mockResolvedValueOnce({
      error: 'Não autenticado',
    });

    render(<BalanceSummaryDashboard />);

    expect(
      await screen.findByText('Não foi possível carregar o dashboard.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Não autenticado')).toBeInTheDocument();
  });

  it('should render summary cards when service returns data', async () => {
    getBalanceSummaryMock.mockResolvedValueOnce({
      data: {
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
      },
    });

    render(<BalanceSummaryDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Wallet Total')).toBeInTheDocument();
    });

    expect(screen.getByText('Dívidas Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Saldo Final')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Banco')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Dinheiro')).toBeInTheDocument();
    expect(screen.getByText('Valores a Receber')).toBeInTheDocument();
  });

  it('should render empty state when service returns no data and no error', async () => {
    getBalanceSummaryMock.mockResolvedValueOnce({});

    render(<BalanceSummaryDashboard />);

    expect(
      await screen.findByText('Nenhum resumo financeiro encontrado.'),
    ).toBeInTheDocument();
  });
});
