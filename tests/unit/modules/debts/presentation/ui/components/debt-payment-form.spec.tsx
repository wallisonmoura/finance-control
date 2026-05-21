import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { DebtPaymentForm } from '@/modules/debts/presentation/ui/components/debt-payment-form';
import { payDebt } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  payDebt: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const payDebtMock = jest.mocked(payDebt);

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

const categories = [
  {
    id: 'category-id',
    name: 'Manutencao',
    slug: 'manutencao',
  },
];

describe('DebtPaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pay a debt successfully', async () => {
    const user = userEvent.setup();
    const onDebtPaid = jest.fn();

    payDebtMock.mockResolvedValueOnce({
      data: {
        ...debt,
        status: 'PAID',
        paidAt: '2026-05-20',
        paymentSource: 'BANK',
      },
    });

    render(
      <DebtPaymentForm
        debt={debt}
        categories={categories}
        onDebtPaid={onDebtPaid}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText('Categoria da despesa'),
      'category-id',
    );
    await user.selectOptions(screen.getByLabelText('Origem do pagamento'), 'BANK');
    await user.clear(screen.getByLabelText('Data do pagamento'));
    await user.type(screen.getByLabelText('Data do pagamento'), '2026-05-20');

    await user.click(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    );

    await waitFor(() => {
      expect(payDebtMock).toHaveBeenCalledWith('debt-id', {
        paidAt: '2026-05-20',
        expenseCategoryId: 'category-id',
        paymentSource: 'BANK',
      });
    });

    expect(onDebtPaid).toHaveBeenCalledTimes(1);
  });

  it('should show a toast when payment fails', async () => {
    const user = userEvent.setup();
    const onDebtPaid = jest.fn();

    payDebtMock.mockResolvedValueOnce({
      error: 'Saldo insuficiente na Wallet.',
    });

    render(
      <DebtPaymentForm
        debt={debt}
        categories={categories}
        onDebtPaid={onDebtPaid}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText('Categoria da despesa'),
      'category-id',
    );

    await user.click(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Saldo insuficiente na Wallet.');
    });

    expect(onDebtPaid).not.toHaveBeenCalled();
    expect(
      screen.queryByText('Saldo insuficiente na Wallet.'),
    ).not.toBeInTheDocument();
  });

  it('should disable submit when categories fail to load', () => {
    render(
      <DebtPaymentForm
        debt={debt}
        categories={[]}
        categoriesError='Nao foi possivel carregar categorias.'
      />,
    );

    expect(
      screen.getByText('Nao foi possivel carregar categorias.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    ).toBeDisabled();
  });
});
