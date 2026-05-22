import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtForm } from '@/modules/debts/presentation/ui/components/debt-form';
import {
  registerDebt,
  updateDebt,
} from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  registerDebt: jest.fn(),
  updateDebt: jest.fn(),
}));

const registerDebtMock = jest.mocked(registerDebt);
const updateDebtMock = jest.mocked(updateDebt);

describe('DebtForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a debt successfully', async () => {
    const user = userEvent.setup();
    const onDebtCreated = jest.fn();

    registerDebtMock.mockResolvedValueOnce({
      data: {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 300.5,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: 'Parcela unica',
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<DebtForm onDebtCreated={onDebtCreated} />);

    await user.selectOptions(screen.getByLabelText('Tipo'), 'ONE_TIME');
    await user.type(screen.getByLabelText('Descrição'), 'Seguro do carro');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '300,50');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');
    await user.type(screen.getByLabelText('Observações'), 'Parcela unica');

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    await waitFor(() => {
      expect(registerDebtMock).toHaveBeenCalledWith({
        description: 'Seguro do carro',
        amount: 300.5,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        notes: 'Parcela unica',
      });
    });

    expect(onDebtCreated).toHaveBeenCalledTimes(1);
  });

  it('should update a debt successfully', async () => {
    const user = userEvent.setup();
    const onDebtUpdated = jest.fn();

    updateDebtMock.mockResolvedValueOnce({
      data: {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro atualizado',
        amount: 350,
        dueDate: '2026-05-21',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(
      <DebtForm
        editingDebt={{
          id: 'debt-id',
          userId: 'user-id',
          description: 'Seguro do carro',
          amount: 300,
          dueDate: '2026-05-20T00:00:00.000Z',
          type: 'ONE_TIME',
          status: 'PENDING',
          notes: null,
          paidAt: null,
          paymentSource: null,
          createdAt: '2026-05-16T00:00:00.000Z',
          updatedAt: '2026-05-16T00:00:00.000Z',
        }}
        onDebtUpdated={onDebtUpdated}
      />,
    );

    await user.clear(screen.getByLabelText('Descrição'));
    await user.type(screen.getByLabelText('Descrição'), 'Seguro atualizado');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '350');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-21');

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => {
      expect(updateDebtMock).toHaveBeenCalledWith('debt-id', {
        description: 'Seguro atualizado',
        amount: 350,
        dueDate: '2026-05-21',
        type: 'ONE_TIME',
      });
    });

    expect(onDebtUpdated).toHaveBeenCalledTimes(1);
  });

  it('should render editing amount with two decimal places', () => {
    render(
      <DebtForm
        editingDebt={{
          id: 'debt-id',
          userId: 'user-id',
          description: 'Seguro do carro',
          amount: 919.1,
          dueDate: '2026-05-20T00:00:00.000Z',
          type: 'ONE_TIME',
          status: 'PENDING',
          notes: null,
          paidAt: null,
          paymentSource: null,
          createdAt: '2026-05-16T00:00:00.000Z',
          updatedAt: '2026-05-16T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByLabelText('Valor')).toHaveValue('919,10');
  });
});
