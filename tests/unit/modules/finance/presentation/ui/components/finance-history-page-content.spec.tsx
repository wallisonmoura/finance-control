import { render, screen } from '@testing-library/react';

import { FinanceHistoryPageContent } from '@/modules/finance/presentation/ui/components/finance-history-page-content';
import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';

jest.mock('@/modules/finance/presentation/ui/hooks/use-finance-history');

const useFinanceHistoryMock = jest.mocked(useFinanceHistory);

describe('FinanceHistoryPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      applyFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Histórico financeiro')).toBeInTheDocument();
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
      applyFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Erro ao carregar histórico.')).toBeInTheDocument();
  });

  it('should render summary and entries', () => {
    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries: [
          {
            id: 'income-id',
            userId: 'user-id',
            type: 'INCOME',
            amount: 400,
            description: 'ganho uber',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: null,
            notes: 'UBER',
            createdAt: '2026-05-07T20:12:15.498Z',
            updatedAt: '2026-05-07T20:12:15.498Z',
          },
        ],
        totalIncome: 400,
        totalExpense: 0,
        balance: 400,
      },
      entries: [
        {
          id: 'income-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 400,
          description: 'ganho uber',
          date: '2026-05-05T00:00:00.000Z',
          categoryId: null,
          notes: 'UBER',
          createdAt: '2026-05-07T20:12:15.498Z',
          updatedAt: '2026-05-07T20:12:15.498Z',
        },
      ],
      totalIncome: 400,
      totalExpense: 0,
      balance: 400,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      isLoading: false,
      error: null,
      applyFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinanceHistoryPageContent />);

    expect(screen.getByText('Receitas do período')).toBeInTheDocument();
    expect(screen.getByText('Despesas do período')).toBeInTheDocument();
    expect(screen.getByText('Resultado do período')).toBeInTheDocument();
    expect(screen.getByText('ganho uber')).toBeInTheDocument();
  });
});
