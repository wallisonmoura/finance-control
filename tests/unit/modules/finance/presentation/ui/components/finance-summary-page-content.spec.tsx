import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { FinanceSummaryPageContent } from '@/modules/finance/presentation/ui/components/finance-summary-page-content';
import { useFinanceOperationalSummary } from '@/modules/finance/presentation/ui/hooks/use-finance-operational-summary';

jest.mock(
  '@/modules/finance/presentation/ui/hooks/use-finance-operational-summary',
);
jest.mock('next/navigation');

const useFinanceOperationalSummaryMock = jest.mocked(
  useFinanceOperationalSummary,
);
const useRouterMock = jest.mocked(useRouter);
const useSearchParamsMock = jest.mocked(useSearchParams);

const applyFilters = jest.fn();
const push = jest.fn();

describe('FinanceSummaryPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useRouterMock.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        month: '2026-05',
      }) as unknown as ReturnType<typeof useSearchParams>,
    );

    useFinanceOperationalSummaryMock.mockReturnValue({
      filters: {
        year: 2026,
        month: 5,
      },
      monthlySummary: {
        year: 2026,
        month: 5,
        totalIncome: 1000,
        totalExpense: 400,
        result: 600,
      },
      dailyRows: [
        {
          date: '2026-05-01',
          day: 1,
          totalIncome: 300,
          totalExpense: 120,
          result: 180,
        },
        {
          date: '2026-05-02',
          day: 2,
          totalIncome: 100,
          totalExpense: 140,
          result: -40,
        },
      ],
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });
  });

  it('should render monthly operational summary table', () => {
    render(<FinanceSummaryPageContent />);

    expect(screen.getByText('Resumo operacional')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para financeiro' }),
    ).toHaveAttribute('href', '/finance');
    expect(screen.getByText('Receitas do mês')).toBeInTheDocument();
    expect(screen.getByText('Despesas do mês')).toBeInTheDocument();
    expect(screen.getByText('Resultado operacional')).toBeInTheDocument();
    expect(screen.getByText('Resultado diário')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Dia' })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Receita' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Despesa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Resultado' }),
    ).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('should initialize summary filters from URL query params', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        month: '2026-04',
      }) as unknown as ReturnType<typeof useSearchParams>,
    );

    useFinanceOperationalSummaryMock.mockReturnValue({
      filters: {
        year: 2026,
        month: 4,
      },
      monthlySummary: null,
      dailyRows: [],
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceSummaryPageContent />);

    expect(useFinanceOperationalSummaryMock).toHaveBeenCalledWith({
      year: 2026,
      month: 4,
    });
    expect(screen.getByLabelText('Mês')).toHaveValue('2026-04');
  });

  it('should update URL when month filter is applied', async () => {
    const user = userEvent.setup();

    render(<FinanceSummaryPageContent />);

    fireEvent.change(screen.getByLabelText('Mês'), {
      target: {
        value: '2026-04',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(push).toHaveBeenCalledWith('/finance/summary?month=2026-04');
    expect(applyFilters).toHaveBeenCalledWith({
      year: 2026,
      month: 4,
    });
  });

  it('should prevent clearing month filter by keyboard', async () => {
    const user = userEvent.setup();

    render(<FinanceSummaryPageContent />);

    await user.clear(screen.getByLabelText('Mês'));

    expect(screen.getByLabelText('Mês')).toHaveValue('2026-05');
  });

  it('should render loading state', () => {
    useFinanceOperationalSummaryMock.mockReturnValue({
      filters: {
        year: 2026,
        month: 5,
      },
      monthlySummary: null,
      dailyRows: [],
      isLoading: true,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    const { container } = render(<FinanceSummaryPageContent />);

    expect(
      screen.queryByText('Carregando resumo financeiro...'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    useFinanceOperationalSummaryMock.mockReturnValue({
      filters: {
        year: 2026,
        month: 5,
      },
      monthlySummary: null,
      dailyRows: [],
      isLoading: false,
      error: 'Não foi possível carregar resumo.',
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceSummaryPageContent />);

    expect(
      screen.getByText('Não foi possível carregar resumo.'),
    ).toBeInTheDocument();
  });
});
