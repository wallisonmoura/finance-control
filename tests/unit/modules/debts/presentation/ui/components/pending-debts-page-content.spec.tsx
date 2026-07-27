import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { PendingDebtsPageContent } from '@/modules/debts/presentation/ui/components/pending-debts-page-content';
import { usePendingDebts } from '@/modules/debts/presentation/ui/hooks/use-pending-debts';
import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { payDebt } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/hooks/use-pending-debts');
jest.mock('@/modules/finance/presentation/ui/hooks/use-expense-categories');
jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  payDebt: jest.fn(),
}));
jest.mock('next/navigation');

const usePendingDebtsMock = jest.mocked(usePendingDebts);
const useExpenseCategoriesMock = jest.mocked(useExpenseCategories);
const useRouterMock = jest.mocked(useRouter);
const payDebtMock = jest.mocked(payDebt);

const refreshMock = jest.fn();
const routerRefreshMock = jest.fn();

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

    useRouterMock.mockReturnValue({
      refresh: routerRefreshMock,
    } as unknown as ReturnType<typeof useRouter>);
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

  it('should refresh the router after paying a debt so the due-soon bell updates', async () => {
    const user = userEvent.setup();

    payDebtMock.mockResolvedValueOnce({
      data: {
        ...debt,
        status: 'PAID',
        paidAt: '2026-05-20',
        paymentSource: 'BANK',
      },
    });

    render(<PendingDebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    await user.selectOptions(
      screen.getByLabelText('Categoria da despesa'),
      'category-id',
    );
    await user.selectOptions(
      screen.getByLabelText('Origem do pagamento'),
      'BANK',
    );
    await user.clear(screen.getByLabelText('Data do pagamento'));
    await user.type(screen.getByLabelText('Data do pagamento'), '2026-05-20');

    await user.click(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    );

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
  });
});
