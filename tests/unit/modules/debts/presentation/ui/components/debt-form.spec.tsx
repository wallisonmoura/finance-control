import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtForm } from '@/modules/debts/presentation/ui/components/debt-form';
import {
  registerDebt,
  registerInstallmentDebt,
  updateDebt,
} from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  registerDebt: jest.fn(),
  registerInstallmentDebt: jest.fn(),
  updateDebt: jest.fn(),
}));

const registerDebtMock = jest.mocked(registerDebt);
const registerInstallmentDebtMock = jest.mocked(registerInstallmentDebt);
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

  it('should reject an amount above the allowed ceiling', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    await user.selectOptions(screen.getByLabelText('Tipo'), 'ONE_TIME');
    await user.type(screen.getByLabelText('Descrição'), 'Seguro do carro');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '1000000000000');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    expect(
      await screen.findByText('Informe um valor de até R$ 999.999.999.999,99.'),
    ).toBeInTheDocument();

    expect(registerDebtMock).not.toHaveBeenCalled();
  });

  it('should accept an amount at the allowed ceiling', async () => {
    const user = userEvent.setup();

    registerDebtMock.mockResolvedValueOnce({
      data: {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 999999999999.99,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<DebtForm />);

    await user.selectOptions(screen.getByLabelText('Tipo'), 'ONE_TIME');
    await user.type(screen.getByLabelText('Descrição'), 'Seguro do carro');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '999999999999,99');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    await waitFor(() => {
      expect(registerDebtMock).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 999999999999.99 }),
      );
    });
  });

  it('should reject a description longer than 255 characters', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'a'.repeat(256) },
    });
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '300');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    expect(
      await screen.findByText('Descrição deve ter no máximo 255 caracteres.'),
    ).toBeInTheDocument();

    expect(registerDebtMock).not.toHaveBeenCalled();
  });

  it('should accept a description at exactly 255 characters', async () => {
    const user = userEvent.setup();
    const description = 'a'.repeat(255);

    registerDebtMock.mockResolvedValueOnce({
      data: {
        id: 'debt-id',
        userId: 'user-id',
        description,
        amount: 300,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<DebtForm />);

    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: description },
    });
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '300');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    await waitFor(() => {
      expect(registerDebtMock).toHaveBeenCalledWith(
        expect.objectContaining({ description }),
      );
    });
  });

  it('should reject notes longer than 1000 characters', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    await user.type(screen.getByLabelText('Descrição'), 'Seguro do carro');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '300');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'a'.repeat(1001) },
    });

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    expect(
      await screen.findByText('Observações devem ter no máximo 1000 caracteres.'),
    ).toBeInTheDocument();

    expect(registerDebtMock).not.toHaveBeenCalled();
  });

  it('should accept notes at exactly 1000 characters', async () => {
    const user = userEvent.setup();
    const notes = 'a'.repeat(1000);

    registerDebtMock.mockResolvedValueOnce({
      data: {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 300,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<DebtForm />);

    await user.type(screen.getByLabelText('Descrição'), 'Seguro do carro');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '300');
    await user.clear(screen.getByLabelText('Vencimento'));
    await user.type(screen.getByLabelText('Vencimento'), '2026-05-20');
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: notes },
    });

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    await waitFor(() => {
      expect(registerDebtMock).toHaveBeenCalledWith(
        expect.objectContaining({ notes }),
      );
    });
  });

  it('should show the installment count select and hide the type select when "Dividir em parcelas?" is checked', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número de parcelas')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Dividir em parcelas?'));

    expect(screen.queryByLabelText('Tipo')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Número de parcelas')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor total')).toBeInTheDocument();
    expect(screen.getByLabelText('Vencimento da 1ª parcela')).toBeInTheDocument();
  });

  it('should not show the "Dividir em parcelas?" checkbox while editing', () => {
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
      />,
    );

    expect(
      screen.queryByLabelText('Dividir em parcelas?'),
    ).not.toBeInTheDocument();
  });

  it('should register a debt in installments successfully', async () => {
    const user = userEvent.setup();
    const onDebtCreated = jest.fn();

    registerInstallmentDebtMock.mockResolvedValueOnce({
      data: [
        {
          id: 'debt-1',
          userId: 'user-id',
          description: 'Cartão Letícia',
          amount: 333.33,
          dueDate: '2026-08-29',
          type: 'RECURRING',
          status: 'PENDING',
          notes: 'Parcela 01/03',
          paidAt: null,
          paymentSource: null,
          createdAt: '2026-08-21T00:00:00.000Z',
          updatedAt: '2026-08-21T00:00:00.000Z',
        },
        {
          id: 'debt-2',
          userId: 'user-id',
          description: 'Cartão Letícia',
          amount: 333.33,
          dueDate: '2026-09-29',
          type: 'RECURRING',
          status: 'PENDING',
          notes: 'Parcela 02/03',
          paidAt: null,
          paymentSource: null,
          createdAt: '2026-08-21T00:00:00.000Z',
          updatedAt: '2026-08-21T00:00:00.000Z',
        },
        {
          id: 'debt-3',
          userId: 'user-id',
          description: 'Cartão Letícia',
          amount: 333.34,
          dueDate: '2026-10-29',
          type: 'RECURRING',
          status: 'PENDING',
          notes: 'Parcela 03/03',
          paidAt: null,
          paymentSource: null,
          createdAt: '2026-08-21T00:00:00.000Z',
          updatedAt: '2026-08-21T00:00:00.000Z',
        },
      ],
    });

    render(<DebtForm onDebtCreated={onDebtCreated} />);

    await user.click(screen.getByLabelText('Dividir em parcelas?'));
    await user.selectOptions(screen.getByLabelText('Número de parcelas'), '3');
    await user.type(screen.getByLabelText('Descrição'), 'Cartão Letícia');
    await user.clear(screen.getByLabelText('Valor total'));
    await user.type(screen.getByLabelText('Valor total'), '1000');
    await user.clear(screen.getByLabelText('Vencimento da 1ª parcela'));
    await user.type(
      screen.getByLabelText('Vencimento da 1ª parcela'),
      '2026-08-29',
    );

    await user.click(screen.getByRole('button', { name: 'Cadastrar dívida' }));

    await waitFor(() => {
      expect(registerInstallmentDebtMock).toHaveBeenCalledWith({
        description: 'Cartão Letícia',
        amount: 1000,
        dueDate: '2026-08-29',
        installmentCount: 3,
      });
    });

    expect(registerDebtMock).not.toHaveBeenCalled();
    expect(onDebtCreated).toHaveBeenCalledTimes(1);
  });

  it('should show an approximate per-installment preview as amount and installment count change', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    await user.click(screen.getByLabelText('Dividir em parcelas?'));
    await user.selectOptions(screen.getByLabelText('Número de parcelas'), '4');
    await user.clear(screen.getByLabelText('Valor total'));
    await user.type(screen.getByLabelText('Valor total'), '1200');

    expect(
      await screen.findByText(/4x de aprox\. R\$ 300,00 cada/),
    ).toBeInTheDocument();
  });

  it('should update the installment count select options with the computed per-installment value', async () => {
    const user = userEvent.setup();

    render(<DebtForm />);

    await user.click(screen.getByLabelText('Dividir em parcelas?'));

    const installmentCountSelect = screen.getByLabelText(
      'Número de parcelas',
    ) as HTMLSelectElement;

    expect(
      within(installmentCountSelect).getByRole('option', { name: '2x' }),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Valor total'));
    await user.type(screen.getByLabelText('Valor total'), '1000');

    expect(
      within(installmentCountSelect).getByRole('option', {
        name: '2x R$ 500,00',
      }),
    ).toBeInTheDocument();
    expect(
      within(installmentCountSelect).getByRole('option', {
        name: '4x R$ 250,00',
      }),
    ).toBeInTheDocument();
  });
});
