import { render, screen } from '@testing-library/react';

import { CategoryExpensesChart } from '@/modules/reports/presentation/ui/components/category-expenses-chart';
import { useCategoryExpensesChart } from '@/modules/reports/presentation/ui/hooks/use-category-expenses-chart';

jest.mock('@/modules/reports/presentation/ui/hooks/use-category-expenses-chart');

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
});
