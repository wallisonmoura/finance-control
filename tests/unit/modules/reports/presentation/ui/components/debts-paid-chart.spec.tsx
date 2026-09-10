import { render, screen } from '@testing-library/react';

import { DebtsPaidChart } from '@/modules/reports/presentation/ui/components/debts-paid-chart';
import { useDebtsPaidChart } from '@/modules/reports/presentation/ui/hooks/use-debts-paid-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-debts-paid-chart');

const useDebtsPaidChartMock = jest.mocked(useDebtsPaidChart);

describe('DebtsPaidChart', () => {
  it('should render the empty state when every month in range has zero total', () => {
    useDebtsPaidChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', total: 0 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPaidChart months={6} />);

    expect(
      screen.getByText('Nenhuma dívida paga no período selecionado.'),
    ).toBeInTheDocument();
  });

  it('should render the error state with a retry button', () => {
    useDebtsPaidChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Falha ao buscar',
      refresh: jest.fn(),
    });

    render(<DebtsPaidChart months={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('should render the chart title when at least one month has data', () => {
    useDebtsPaidChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', total: 650 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPaidChart months={6} />);

    expect(screen.getByText('Dívidas pagas')).toBeInTheDocument();
  });
});
