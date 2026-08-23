import { render, screen } from '@testing-library/react';

import { DebtsPendingPaidChart } from '@/modules/reports/presentation/ui/components/debts-pending-paid-chart';
import { useDebtsPendingPaidChart } from '@/modules/reports/presentation/ui/hooks/use-debts-pending-paid-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-debts-pending-paid-chart');

const useDebtsPendingPaidChartMock = jest.mocked(useDebtsPendingPaidChart);

describe('DebtsPendingPaidChart', () => {
  it('should render the empty state when every month in range has zero pending and paid totals', () => {
    useDebtsPendingPaidChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', pendingTotal: 0, paidTotal: 0 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPendingPaidChart months={6} />);

    expect(
      screen.getByText('Nenhuma dívida encontrada no período selecionado.'),
    ).toBeInTheDocument();
  });

  it('should render the error state with a retry button', () => {
    useDebtsPendingPaidChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Falha ao buscar',
      refresh: jest.fn(),
    });

    render(<DebtsPendingPaidChart months={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('should render the chart title when at least one month has data', () => {
    useDebtsPendingPaidChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', pendingTotal: 200, paidTotal: 100 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPendingPaidChart months={6} />);

    expect(screen.getByText('Dívidas pendentes × pagas')).toBeInTheDocument();
  });
});
