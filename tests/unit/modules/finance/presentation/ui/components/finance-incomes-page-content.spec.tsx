import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FinanceIncomesPageContent } from '@/modules/finance/presentation/ui/components/finance-incomes-page-content';
import { useFinanceHistory } from '@/modules/finance/presentation/ui/hooks/use-finance-history';
import { deleteIncome } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/hooks/use-finance-history');
jest.mock(
  '@/modules/finance/presentation/ui/services/finance-api.service',
  () => ({
    deleteIncome: jest.fn(),
    registerIncome: jest.fn(),
    updateIncome: jest.fn(),
  }),
);

const useFinanceHistoryMock = jest.mocked(useFinanceHistory);
const deleteIncomeMock = jest.mocked(deleteIncome);

const refreshMock = jest.fn();

const incomeEntry = {
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
};

describe('FinanceIncomesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useFinanceHistoryMock.mockReturnValue({
      data: {
        entries: [incomeEntry],
        totalIncome: 400,
        totalExpense: 0,
        balance: 400,
      },
      entries: [incomeEntry],
      totalIncome: 400,
      totalExpense: 0,
      balance: 400,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        type: 'INCOME',
      },
      isLoading: false,
      error: null,
      applyFilters: jest.fn(),
      refresh: refreshMock,
    });
  });

  it('should render incomes page', () => {
    render(<FinanceIncomesPageContent />);

    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('ganho uber')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para financeiro' }),
    ).toHaveAttribute('href', '/finance');

    expect(
      screen.getByRole('button', { name: 'Nova receita' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('should open create income form', async () => {
    const user = userEvent.setup();

    render(<FinanceIncomesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Nova receita' }));

    expect(
      screen.getByRole('heading', { name: 'Nova receita' }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1);
  });

  it('should open edit income form', async () => {
    const user = userEvent.setup();

    render(<FinanceIncomesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByText('Editar receita')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ganho uber')).toBeInTheDocument();
    expect(screen.getByDisplayValue('400,00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('UBER')).toBeInTheDocument();
  });

  it('should delete an income when confirmed', async () => {
    const user = userEvent.setup();

    deleteIncomeMock.mockResolvedValueOnce({
      data: undefined,
    });

    render(<FinanceIncomesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog');

    expect(
      within(dialog).getByText('Deseja excluir a receita "ganho uber"?'),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteIncomeMock).toHaveBeenCalledWith('income-id');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('should not delete an income when confirmation is cancelled', async () => {
    const user = userEvent.setup();

    render(<FinanceIncomesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog');

    await user.click(
      within(dialog).getByRole('button', { name: 'Cancelar' }),
    );

    expect(deleteIncomeMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('should render delete error', async () => {
    const user = userEvent.setup();

    deleteIncomeMock.mockResolvedValueOnce({
      error: 'Não foi possível excluir a receita.',
    });

    render(<FinanceIncomesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog');

    await user.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(
      await screen.findByText('Não foi possível excluir a receita.'),
    ).toBeInTheDocument();
  });
});
