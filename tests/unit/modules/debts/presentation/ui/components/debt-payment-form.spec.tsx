import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { DebtPaymentForm } from '@/modules/debts/presentation/ui/components/debt-payment-form';
import {
  payDebt,
  undoDebtPayment,
} from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  payDebt: jest.fn(),
  undoDebtPayment: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const payDebtMock = jest.mocked(payDebt);
const undoDebtPaymentMock = jest.mocked(undoDebtPayment);

type ToastOptions = { duration: number; action: { label: string; onClick: () => void } };

async function payThroughTheForm(onPaymentUndone?: () => void) {
  const user = userEvent.setup();

  payDebtMock.mockResolvedValueOnce({
    data: { ...debt, status: 'PAID', paidAt: '2026-05-20', paymentSource: 'BANK' },
  });

  render(
    <DebtPaymentForm debt={debt} categories={categories} onPaymentUndone={onPaymentUndone} />,
  );

  await user.selectOptions(screen.getByLabelText('Categoria da despesa'), 'category-id');
  await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());

  return jest.mocked(toast.success).mock.calls[0][1] as unknown as ToastOptions;
}

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
  paymentRecordedAt: null,
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
        categoriesError='Não foi possível carregar categorias.'
      />,
    );

    expect(
      screen.getByText('Não foi possível carregar categorias.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    ).toBeDisabled();
  });

  it('should not allow future payment date', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-27T12:00:00-03:00'));

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    render(<DebtPaymentForm debt={debt} categories={categories} />);

    const paidAtInput = screen.getByLabelText('Data do pagamento');

    expect(paidAtInput).toHaveValue('2026-05-27');
    expect(paidAtInput).toHaveAttribute('max', '2026-05-27');

    await user.selectOptions(
      screen.getByLabelText('Categoria da despesa'),
      'category-id',
    );
    await user.clear(paidAtInput);
    await user.type(paidAtInput, '2026-05-28');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar pagamento' }),
    );

    expect(
      await screen.findByText('Informe uma data de hoje ou anterior.'),
    ).toBeInTheDocument();
    expect(payDebtMock).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should offer "Desfazer" for 10 seconds in the success toast', async () => {
    const options = await payThroughTheForm();

    expect(toast.success).toHaveBeenCalledWith('Dívida paga com sucesso.', expect.anything());
    expect(options.duration).toBe(10000);
    expect(options.action.label).toBe('Desfazer');
  });

  it('should undo through the toast action and notify the page', async () => {
    const onPaymentUndone = jest.fn();
    undoDebtPaymentMock.mockResolvedValueOnce({ data: { ...debt } });
    const options = await payThroughTheForm(onPaymentUndone);

    options.action.onClick();

    await waitFor(() => expect(onPaymentUndone).toHaveBeenCalledTimes(1));
    expect(undoDebtPaymentMock).toHaveBeenCalledWith('debt-id');
    expect(toast.success).toHaveBeenCalledWith('Pagamento desfeito.');
  });

  it('should show the error when undoing through the toast fails', async () => {
    const onPaymentUndone = jest.fn();
    undoDebtPaymentMock.mockResolvedValueOnce({
      error: 'O prazo pra desfazer este pagamento acabou.',
    });
    const options = await payThroughTheForm(onPaymentUndone);

    options.action.onClick();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('O prazo pra desfazer este pagamento acabou.'),
    );
    expect(onPaymentUndone).not.toHaveBeenCalled();
  });
});
