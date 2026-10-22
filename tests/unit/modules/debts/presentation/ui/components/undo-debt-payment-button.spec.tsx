import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { UndoDebtPaymentButton } from '@/modules/debts/presentation/ui/components/undo-debt-payment-button';
import { undoDebtPayment } from '@/modules/debts/presentation/ui/services/debt-api.service';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));
jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  undoDebtPayment: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const undoDebtPaymentMock = jest.mocked(undoDebtPayment);

const debt: DebtUi = {
  id: 'debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: '2026-10-20T00:00:00.000Z',
  type: 'ONE_TIME',
  status: 'PAID',
  notes: null,
  paidAt: '2026-10-20T00:00:00.000Z',
  paymentSource: 'BANK',
  paymentRecordedAt: '2026-10-21T12:00:00.000Z',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-21T12:00:00.000Z',
};

function normalizeSpaces(text: string | null | undefined) {
  return (text ?? '').replace(/\s/g, ' ');
}

describe('UndoDebtPaymentButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should name the button after the debt so screen readers can tell the rows apart', () => {
    render(<UndoDebtPaymentButton debt={debt} />);

    expect(
      screen.getByRole('button', { name: 'Desfazer pagamento de Seguro do carro' }),
    ).toHaveTextContent('Desfazer pagamento');
  });

  it('should ask for confirmation showing the amount and where it goes back', async () => {
    const user = userEvent.setup();
    render(<UndoDebtPaymentButton debt={debt} />);

    await user.click(screen.getByRole('button', { name: /^Desfazer pagamento/ }));

    const dialog = await screen.findByRole('alertdialog');
    expect(normalizeSpaces(dialog.textContent)).toContain('R$ 300,00 volta para Banco');
    expect(dialog.textContent).not.toContain('próxima ocorrência');
  });

  it('should mention the next occurrence for recurring debts', async () => {
    const user = userEvent.setup();
    render(<UndoDebtPaymentButton debt={{ ...debt, type: 'RECURRING' }} />);

    await user.click(screen.getByRole('button', { name: /^Desfazer pagamento/ }));

    expect((await screen.findByRole('alertdialog')).textContent).toContain(
      'A próxima ocorrência criada por este pagamento também será apagada, se ainda estiver pendente.',
    );
  });

  it('should undo, show the toast and refresh after confirming', async () => {
    const user = userEvent.setup();
    undoDebtPaymentMock.mockResolvedValue({ data: { ...debt, status: 'PENDING' } });
    render(<UndoDebtPaymentButton debt={debt} />);

    await user.click(screen.getByRole('button', { name: /^Desfazer pagamento/ }));
    await user.click(await screen.findByRole('button', { name: 'Desfazer' }));

    await waitFor(() => expect(undoDebtPaymentMock).toHaveBeenCalledWith('debt-id'));
    expect(toast.success).toHaveBeenCalledWith('Pagamento desfeito.');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should show the API error and keep the page as is', async () => {
    const user = userEvent.setup();
    undoDebtPaymentMock.mockResolvedValue({
      error: 'O prazo pra desfazer este pagamento acabou.',
    });
    render(<UndoDebtPaymentButton debt={debt} />);

    await user.click(screen.getByRole('button', { name: /^Desfazer pagamento/ }));
    await user.click(await screen.findByRole('button', { name: 'Desfazer' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('O prazo pra desfazer este pagamento acabou.'),
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should let the page reload its own list after the undo', async () => {
    const user = userEvent.setup();
    const onUndone = jest.fn();
    undoDebtPaymentMock.mockResolvedValue({ data: { ...debt, status: 'PENDING' } });
    render(<UndoDebtPaymentButton debt={debt} onUndone={onUndone} />);

    await user.click(screen.getByRole('button', { name: /^Desfazer pagamento/ }));
    await user.click(await screen.findByRole('button', { name: 'Desfazer' }));

    await waitFor(() => expect(onUndone).toHaveBeenCalledTimes(1));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
