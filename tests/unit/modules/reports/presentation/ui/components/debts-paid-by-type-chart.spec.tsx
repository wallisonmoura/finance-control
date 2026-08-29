import { render, screen } from '@testing-library/react';

import { DebtsPaidByTypeChart } from '@/modules/reports/presentation/ui/components/debts-paid-by-type-chart';
import { useDebtsPaidByTypeChart } from '@/modules/reports/presentation/ui/hooks/use-debts-paid-by-type-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-debts-paid-by-type-chart');

const useDebtsPaidByTypeChartMock = jest.mocked(useDebtsPaidByTypeChart);

describe('DebtsPaidByTypeChart', () => {
  it('should render the empty state when every month in range has zero totals', () => {
    useDebtsPaidByTypeChartMock.mockReturnValue({
      data: [
        {
          monthLabel: 'ago/26',
          oneTimeTotal: 0,
          installmentTotal: 0,
          recurringTotal: 0,
        },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPaidByTypeChart months={6} />);

    expect(
      screen.getByText('Nenhuma dívida paga no período selecionado.'),
    ).toBeInTheDocument();
  });

  it('should render the error state with a retry button', () => {
    useDebtsPaidByTypeChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Falha ao buscar',
      refresh: jest.fn(),
    });

    render(<DebtsPaidByTypeChart months={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('should render the chart title when at least one month has data', () => {
    useDebtsPaidByTypeChartMock.mockReturnValue({
      data: [
        {
          monthLabel: 'ago/26',
          oneTimeTotal: 200,
          installmentTotal: 150,
          recurringTotal: 300,
        },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPaidByTypeChart months={6} />);

    expect(screen.getByText('Dívidas pagas por tipo')).toBeInTheDocument();
  });
});
