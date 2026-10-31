import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { IncomeExpenseEvolutionChart } from '@/modules/reports/presentation/ui/components/income-expense-evolution-chart';
import { useIncomeExpenseEvolutionChart } from '@/modules/reports/presentation/ui/hooks/use-income-expense-evolution-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-income-expense-evolution-chart');
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const useIncomeExpenseEvolutionChartMock = jest.mocked(
  useIncomeExpenseEvolutionChart,
);

describe('IncomeExpenseEvolutionChart', () => {
  it('should render the empty state when every month in range has zero income and expense', () => {
    useIncomeExpenseEvolutionChartMock.mockReturnValue({
      data: [
        { monthLabel: 'jul/26', totalIncome: 0, totalExpense: 0 },
        { monthLabel: 'ago/26', totalIncome: 0, totalExpense: 0 },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<IncomeExpenseEvolutionChart months={6} />);

    expect(
      screen.getByText('Nenhum lançamento registrado no período selecionado.'),
    ).toBeInTheDocument();
  });

  it('should render the error state with a retry button', () => {
    useIncomeExpenseEvolutionChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Falha ao buscar',
      refresh: jest.fn(),
    });

    render(<IncomeExpenseEvolutionChart months={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('should render the chart title when at least one month has data', () => {
    useIncomeExpenseEvolutionChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', totalIncome: 100, totalExpense: 40 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<IncomeExpenseEvolutionChart months={6} />);

    expect(screen.getByText('Receita × despesa por mês')).toBeInTheDocument();
  });

  it('should link to the revenue and profit histories with the current period', () => {
    useIncomeExpenseEvolutionChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', totalIncome: 100, totalExpense: 40 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<IncomeExpenseEvolutionChart months={12} />);

    expect(screen.getByRole('link', { name: 'Histórico do faturamento' })).toHaveAttribute(
      'href',
      '/relatorios/metas/faturamento?months=12',
    );
    expect(screen.getByRole('link', { name: 'Histórico do lucro' })).toHaveAttribute(
      'href',
      '/relatorios/metas/lucro?months=12',
    );
  });
  // Screen readers get a description and the values behind the bars.
  it('should describe the chart and offer its data as a table', async () => {
    const user = userEvent.setup();
    useIncomeExpenseEvolutionChartMock.mockReturnValue({
      data: [{ monthLabel: 'ago/26', totalIncome: 100, totalExpense: 40 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<IncomeExpenseEvolutionChart months={6} />);

    expect(
      screen.getByText(/^Gráfico de barras de receita e despesa por mês, de ago\/26 a ago\/26\./),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    const row = screen.getByRole('rowheader', { name: 'ago/26' }).closest('tr');
    expect(row).toHaveTextContent(/R\$\s100,00.*R\$\s40,00.*R\$\s60,00/);
  });
});
