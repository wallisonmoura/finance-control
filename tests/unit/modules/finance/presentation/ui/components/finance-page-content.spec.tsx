import { render, screen } from '@testing-library/react';

import { FinancePageContent } from '@/modules/finance/presentation/ui/components/finance-page-content';
import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';

jest.mock(
  '@/modules/finance/presentation/ui/hooks/use-finance-history',
  () => ({
    useFinanceHistory: jest.fn(),
  }),
);

jest.mock('@/modules/finance/presentation/ui/components/income-form', () => ({
  IncomeForm: ({ onIncomeCreated }: { onIncomeCreated?: () => void }) => (
    <button type='button' onClick={onIncomeCreated}>
      Mock Income Form
    </button>
  ),
}));

const useFinanceHistoryMock = useFinanceHistory as jest.MockedFunction<
  typeof useFinanceHistory
>;

describe('FinancePageContent', () => {
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
      isLoading: true,
      error: null,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinancePageContent />);

    expect(screen.getByText('Financeiro')).toBeInTheDocument();
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
      isLoading: false,
      error: 'Não foi possível carregar o histórico.',
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinancePageContent />);

    expect(
      screen.getByText('Não foi possível carregar o histórico.'),
    ).toBeInTheDocument();
  });

  it('should render summary and history list on success', () => {
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
      isLoading: false,
      error: null,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinancePageContent />);

    expect(screen.getByText('Receitas do período')).toBeInTheDocument();
    expect(screen.getByText('Despesas do período')).toBeInTheDocument();
    expect(screen.getByText('Resultado do período')).toBeInTheDocument();
    expect(screen.getByText('ganho uber')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 400,00').length).toBeGreaterThan(0);
  });

  it('should render empty history state on success without entries', () => {
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
      isLoading: false,
      error: null,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<FinancePageContent />);

    expect(
      screen.getByText(
        'Nenhum lançamento encontrado para o período selecionado.',
      ),
    ).toBeInTheDocument();
  });
});
