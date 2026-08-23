import { render, screen } from '@testing-library/react';

import { IncomeExpenseEvolutionChart } from '@/modules/reports/presentation/ui/components/income-expense-evolution-chart';
import { useIncomeExpenseEvolutionChart } from '@/modules/reports/presentation/ui/hooks/use-income-expense-evolution-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-income-expense-evolution-chart');

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
});
