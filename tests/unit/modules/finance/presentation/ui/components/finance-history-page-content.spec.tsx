import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { FinanceHistoryPageContent } from '@/modules/finance/presentation/ui/components/finance-history-page-content';
import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';
import { ExpenseCategoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

jest.mock('@/modules/finance/presentation/ui/hooks/use-finance-history', () => {
  const actual = jest.requireActual(
    '@/modules/finance/presentation/ui/hooks/use-finance-history',
  );

  return {
    ...actual,
    useFinanceHistory: jest.fn(),
  };
});
jest.mock('next/navigation');

const useFinanceHistoryMock = jest.mocked(useFinanceHistory);
const useRouterMock = jest.mocked(useRouter);
const useSearchParamsMock = jest.mocked(useSearchParams);

describe('FinanceHistoryPageContent', () => {
  const push = jest.fn();
  const applyFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useRouterMock.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      }) as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  it('should render loading state', () => {
    useFinanceHistoryMock.mockReturnValue({
      data: null,
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: true,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para financeiro' }),
    ).toHaveAttribute('href', '/finance');
    expect(
      screen.getByText('Carregando histórico financeiro...'),
    ).toBeInTheDocument();
  });

  it('should render error state', () => {
    useFinanceHistoryMock.mockReturnValue({
      data: null,
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: false,
      error: 'Erro ao carregar histórico.',
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Erro ao carregar histórico.')).toBeInTheDocument();
  });

  it('should render summary and entries', () => {
    const entries = [
      {
        id: 'income-id',
        userId: 'user-id',
        type: 'INCOME' as const,
        amount: 400,
        description: 'ganho uber',
        date: '2026-05-05T00:00:00.000Z',
        categoryId: null,
        notes: 'UBER',
        createdAt: '2026-05-07T20:12:15.498Z',
        updatedAt: '2026-05-07T20:12:15.498Z',
      },
    ];

    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries,
        totalIncome: 400,
        totalExpense: 0,
        balance: 400,
      },
      entries,
      totalIncome: 400,
      totalExpense: 0,
      balance: 400,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Total de receitas')).toBeInTheDocument();
    expect(screen.getByText('Total de despesas')).toBeInTheDocument();
    expect(screen.getByText('Saldo no período')).toBeInTheDocument();
    expect(screen.getByText('Total de movimentações')).toBeInTheDocument();
    expect(screen.getByText('ganho uber')).toBeInTheDocument();
  });

  it('should initialize history filters from URL query params', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        startDate: '2026-05-10',
        endDate: '2026-05-20',
        type: 'INCOME',
      }) as unknown as ReturnType<typeof useSearchParams>,
    );

    useFinanceHistoryMock.mockReturnValue({
      data: null,
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      filters: {
        startDate: '2026-05-10',
        endDate: '2026-05-20',
        type: 'INCOME',
      },
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(useFinanceHistoryMock).toHaveBeenCalledWith({
      startDate: '2026-05-10',
      endDate: '2026-05-20',
      type: 'INCOME',
    });
  });

  it('should update URL when filters are applied', async () => {
    const user = userEvent.setup();

    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      },
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    await user.clear(screen.getByLabelText('Data inicial'));
    await user.type(screen.getByLabelText('Data inicial'), '2026-05-10');
    await user.clear(screen.getByLabelText('Data final'));
    await user.type(screen.getByLabelText('Data final'), '2026-05-20');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'EXPENSE');
    await user.click(
      screen.getByRole('button', { name: 'Aplicar filtros' }),
    );

    expect(push).toHaveBeenCalledWith(
      '/finance/history?startDate=2026-05-10&endDate=2026-05-20&type=EXPENSE',
    );
    expect(applyFilters).toHaveBeenCalledWith({
      startDate: '2026-05-10',
      endDate: '2026-05-20',
      type: 'EXPENSE',
    });
  });

  it('should push categoryId in the URL when a category filter is applied', async () => {
    const user = userEvent.setup();

    const categories: ExpenseCategoryUi[] = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Combustível',
        slug: 'combustivel',
      },
    ];

    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      },
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: false,
      error: null,
      applyFilters,
      refresh: jest.fn(),
    });

    render(
      <FinanceHistoryPageContent initialCategories={categories} />,
    );

    await user.selectOptions(screen.getByLabelText('Tipo'), 'EXPENSE');
    await user.selectOptions(
      screen.getByLabelText('Categoria'),
      '11111111-1111-4111-8111-111111111111',
    );
    await user.click(
      screen.getByRole('button', { name: 'Aplicar filtros' }),
    );

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(
        'categoryId=11111111-1111-4111-8111-111111111111',
      ),
    );
    expect(applyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: '11111111-1111-4111-8111-111111111111',
      }),
    );
  });
});
