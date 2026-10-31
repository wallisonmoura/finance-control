import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { CategoryExpensesChart } from '@/modules/reports/presentation/ui/components/category-expenses-chart';
import { useCategoryExpensesChart } from '@/modules/reports/presentation/ui/hooks/use-category-expenses-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-category-expenses-chart');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const useCategoryExpensesChartMock = jest.mocked(useCategoryExpensesChart);

describe('CategoryExpensesChart', () => {
  it('should render the empty state when there is no data', () => {
    useCategoryExpensesChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CategoryExpensesChart months={6} />);

    expect(
      screen.getByText('Nenhuma despesa registrada no período selecionado.'),
    ).toBeInTheDocument();
  });

  it('should render the error state with a retry button', () => {
    const refresh = jest.fn();
    useCategoryExpensesChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Falha ao buscar',
      refresh,
    });

    render(<CategoryExpensesChart months={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
  });

  it('should render the chart title when data is present', () => {
    useCategoryExpensesChartMock.mockReturnValue({
      data: [{ categoryId: 'cat-1', categoryName: 'Alimentação', total: 100 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CategoryExpensesChart months={6} />);

    expect(screen.getByText('Gastos por categoria')).toBeInTheDocument();
  });

  it('should hint that a category opens its history', () => {
    useCategoryExpensesChartMock.mockReturnValue({
      data: [{ categoryId: 'cat-1', categoryName: 'Alimentação', total: 100 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CategoryExpensesChart months={6} />);

    expect(
      screen.getByText('Clique numa categoria para ver o histórico.'),
    ).toBeInTheDocument();
  });

  it('should not show the hint without data', () => {
    useCategoryExpensesChartMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CategoryExpensesChart months={6} />);

    expect(
      screen.queryByText('Clique numa categoria para ver o histórico.'),
    ).not.toBeInTheDocument();
  });
  // Screen readers get a description and the values behind the bars.
  it('should describe the chart and offer its data as a table', async () => {
    const user = userEvent.setup();
    useCategoryExpensesChartMock.mockReturnValue({
      data: [{ categoryId: 'cat-1', categoryName: 'Alimentação', total: 100 }],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CategoryExpensesChart months={6} />);

    expect(screen.getByText(/^Gráfico de barras dos gastos por categoria no período/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    expect(screen.getByRole('rowheader', { name: 'Alimentação' }).closest('tr')).toHaveTextContent(
      /R\$\s100,00/,
    );
  });
});
