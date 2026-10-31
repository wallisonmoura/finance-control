import userEvent from '@testing-library/user-event';
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
  // Screen readers get a description and the values behind the bars.
  it('should describe the chart and offer its data as a table', async () => {
    const user = userEvent.setup();
    useDebtsPaidChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', total: 650 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<DebtsPaidChart months={6} />);

    expect(screen.getByText(/^Gráfico de barras do valor pago em dívidas por mês/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    expect(screen.getByRole('rowheader', { name: 'ago/26' }).closest('tr')).toHaveTextContent(
      /R\$\s650,00/,
    );
  });
});
