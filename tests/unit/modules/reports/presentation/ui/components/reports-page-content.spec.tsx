import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { ReportsPageContent } from '@/modules/reports/presentation/ui/components/reports-page-content';

jest.mock('next/navigation');
jest.mock(
  '@/modules/reports/presentation/ui/components/category-expenses-chart',
  () => ({
    CategoryExpensesChart: ({ months }: { months: number }) => (
      <div data-testid='category-chart'>{months}</div>
    ),
  }),
);
jest.mock(
  '@/modules/reports/presentation/ui/components/income-expense-evolution-chart',
  () => ({
    IncomeExpenseEvolutionChart: ({ months }: { months: number }) => (
      <div data-testid='evolution-chart'>{months}</div>
    ),
  }),
);
jest.mock(
  '@/modules/reports/presentation/ui/components/debts-paid-by-type-chart',
  () => ({
    DebtsPaidByTypeChart: ({ months }: { months: number }) => (
      <div data-testid='debts-chart'>{months}</div>
    ),
  }),
);

const useRouterMock = jest.mocked(useRouter);

describe('ReportsPageContent', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('should render the page title and the 3 charts with the initial period', () => {
    render(<ReportsPageContent initialMonths={6} />);

    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByTestId('category-chart')).toHaveTextContent('6');
    expect(screen.getByTestId('evolution-chart')).toHaveTextContent('6');
    expect(screen.getByTestId('debts-chart')).toHaveTextContent('6');
  });

  it('should not render a selectable empty placeholder option in the period select', () => {
    render(<ReportsPageContent initialMonths={6} />);

    expect(
      screen.queryByRole('option', { name: 'Selecione uma opção' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('should push the new URL and update all 3 charts when the period changes', async () => {
    const user = userEvent.setup();
    render(<ReportsPageContent initialMonths={6} />);

    await user.selectOptions(
      screen.getByLabelText('Período'),
      screen.getByRole('option', { name: '12 meses' }),
    );

    expect(push).toHaveBeenCalledWith('/relatorios?months=12', {
      scroll: false,
    });
    expect(screen.getByTestId('category-chart')).toHaveTextContent('12');
    expect(screen.getByTestId('evolution-chart')).toHaveTextContent('12');
    expect(screen.getByTestId('debts-chart')).toHaveTextContent('12');
  });
});
