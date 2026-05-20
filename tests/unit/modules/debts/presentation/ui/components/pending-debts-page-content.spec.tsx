import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PendingDebtsPageContent } from '@/modules/debts/presentation/ui/components/pending-debts-page-content';
import { usePendingDebts } from '@/modules/debts/presentation/ui/hooks/use-pending-debts';
import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';

jest.mock('@/modules/debts/presentation/ui/hooks/use-pending-debts');
jest.mock('@/modules/finance/presentation/ui/hooks/use-expense-categories');
jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  payDebt: jest.fn(),
}));

const usePendingDebtsMock = jest.mocked(usePendingDebts);
const useExpenseCategoriesMock = jest.mocked(useExpenseCategories);

const refreshMock = jest.fn();

const debt = {
  id: 'debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: '2026-05-20T00:00:00.000Z',
  type: 'ONE_TIME' as const,
  status: 'PENDING' as const,
  notes: null,
  paidAt: null,
  paymentSource: null,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

describe('PendingDebtsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePendingDebtsMock.mockReturnValue({
      debts: [debt],
      isLoading: false,
      error: null,
      refresh: refreshMock,
    });

    useExpenseCategoriesMock.mockReturnValue({
      categories: [
        {
          id: 'category-id',
          name: 'Manutencao',
          slug: 'manutencao',
        },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it('should render pending debts page', () => {
    render(<PendingDebtsPageContent />);

    expect(screen.getByText('Dívidas pendentes')).toBeInTheDocument();
    expect(screen.getByText('Seguro do carro')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para dívidas' })).toHaveAttribute(
      'href',
      '/debts',
    );
    expect(screen.getByRole('button', { name: 'Pagar' })).toBeInTheDocument();
  });

  it('should open payment form', async () => {
    const user = userEvent.setup();

    render(<PendingDebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    expect(screen.getByRole('heading', { name: 'Pagar dívida' })).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria da despesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Origem do pagamento')).toBeInTheDocument();
  });
});
