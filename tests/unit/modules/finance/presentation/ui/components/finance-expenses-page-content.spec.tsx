import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FinanceExpensesPageContent } from '@/modules/finance/presentation/ui/components/finance-expenses-page-content';
import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';
import { deleteExpense } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/hooks/use-finance-history');
jest.mock('@/modules/finance/presentation/ui/hooks/use-expense-categories');
jest.mock(
  '@/modules/finance/presentation/ui/services/finance-api.service',
  () => ({
    deleteExpense: jest.fn(),
    registerExpense: jest.fn(),
    updateExpense: jest.fn(),
  }),
);

const useFinanceHistoryMock = jest.mocked(useFinanceHistory);
const useExpenseCategoriesMock = jest.mocked(useExpenseCategories);
const deleteExpenseMock = jest.mocked(deleteExpense);

const refreshMock = jest.fn();

const expenseEntry = {
  id: 'expense-id',
  userId: 'user-id',
  type: 'EXPENSE' as const,
  amount: 120,
  description: 'Combustivel',
  date: '2026-05-16T00:00:00.000Z',
  categoryId: 'category-id',
  notes: 'Posto',
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

describe('FinanceExpensesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries: [expenseEntry],
        totalIncome: 0,
        totalExpense: 120,
        balance: -120,
      },
      entries: [expenseEntry],
      totalIncome: 0,
      totalExpense: 120,
      balance: -120,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        type: 'EXPENSE',
      },
      isLoading: false,
      error: null,
      applyFilters: jest.fn(),
      refresh: refreshMock,
    });

    useExpenseCategoriesMock.mockReturnValue({
      categories: [
        {
          id: 'category-id',
          name: 'Combustivel',
          slug: 'combustivel',
        },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it('should render expenses page', () => {
    render(<FinanceExpensesPageContent />);

    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Combustivel')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para financeiro' }),
    ).toHaveAttribute('href', '/finance');
    expect(
      screen.getByRole('button', { name: 'Nova despesa' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('should open create expense form', async () => {
    const user = userEvent.setup();

    render(<FinanceExpensesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Nova despesa' }));

    expect(
      screen.getByRole('heading', { name: 'Nova despesa' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria *')).toBeInTheDocument();
  });

  it('should open edit expense form', async () => {
    const user = userEvent.setup();

    render(<FinanceExpensesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByText('Editar despesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição *')).toHaveValue('Combustivel');
    expect(screen.getByDisplayValue('120,00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Posto')).toBeInTheDocument();
  });

  it('should delete an expense when confirmed', async () => {
    const user = userEvent.setup();

    deleteExpenseMock.mockResolvedValueOnce({
      data: undefined,
    });

    render(<FinanceExpensesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog');

    expect(
      within(dialog).getByText('Deseja excluir a despesa "Combustivel"?'),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteExpenseMock).toHaveBeenCalledWith('expense-id');
    expect(refreshMock).toHaveBeenCalled();
  });
});
