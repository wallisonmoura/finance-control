import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { IncomeForm } from '@/modules/finance/presentation/ui/components/income-form';
import { registerIncome } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock(
  '@/modules/finance/presentation/ui/services/finance-api.service',
  () => ({
    registerIncome: jest.fn(),
  }),
);
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

const registerIncomeMock = registerIncome as jest.MockedFunction<
  typeof registerIncome
>;

const descriptionLabel = 'Descrição *';
const amountLabel = 'Valor (R$) *';
const dateLabel = 'Data *';
const notesLabel = 'Observação (opcional)';

describe('IncomeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register an income successfully', async () => {
    const user = userEvent.setup();
    const onIncomeCreated = jest.fn();

    registerIncomeMock.mockResolvedValueOnce({
      data: {
        id: 'income-id',
        userId: 'user-id',
        type: 'INCOME',
        amount: 400,
        description: 'Corrida Nova',
        date: '2026-04-10',
        categoryId: null,
        notes: 'Pagamento PIX',
        createdAt: '2026-05-07T19:43:27.751Z',
        updatedAt: '2026-05-07T19:43:27.751Z',
      },
    });

    render(<IncomeForm onIncomeCreated={onIncomeCreated} />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida Nova');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '400,50');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-04-10');
    await user.type(screen.getByLabelText(notesLabel), 'Pagamento PIX');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    await waitFor(() => {
      expect(registerIncomeMock).toHaveBeenCalledWith({
        amount: 400.5,
        description: 'Corrida Nova',
        date: '2026-04-10',
        notes: 'Pagamento PIX',
      });
    });

    expect(onIncomeCreated).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Receita registrada com sucesso.',
    );
  });

  it('should omit notes when notes is empty', async () => {
    const user = userEvent.setup();

    registerIncomeMock.mockResolvedValueOnce({
      data: {
        id: 'income-id',
        userId: 'user-id',
        type: 'INCOME',
        amount: 100,
        description: 'Corrida',
        date: '2026-04-10',
        categoryId: null,
        notes: null,
        createdAt: '2026-05-07T19:43:27.751Z',
        updatedAt: '2026-05-07T19:43:27.751Z',
      },
    });

    render(<IncomeForm />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '100');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    await waitFor(() => {
      expect(registerIncomeMock).toHaveBeenCalledWith({
        amount: 100,
        description: 'Corrida',
        date: '2026-04-10',
      });
    });
  });

  it('should render editing amount with two decimal places', () => {
    render(
      <IncomeForm
        editingIncome={{
          id: 'income-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 919.1,
          description: 'Corrida',
          date: '2026-04-10T00:00:00.000Z',
          categoryId: null,
          notes: null,
          createdAt: '2026-05-07T19:43:27.751Z',
          updatedAt: '2026-05-07T19:43:27.751Z',
        }}
      />,
    );

    expect(screen.getByLabelText(amountLabel)).toHaveValue('919,10');
  });

  it('should validate amount before submitting', async () => {
    const user = userEvent.setup();

    render(<IncomeForm />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida Nova');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '0');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    expect(
      await screen.findByText('Informe um valor maior que zero.'),
    ).toBeInTheDocument();

    expect(registerIncomeMock).not.toHaveBeenCalled();
  });

  it('should validate future date before submitting', async () => {
    const user = userEvent.setup();

    render(<IncomeForm />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida Nova');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '100');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2999-01-01');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    expect(
      await screen.findByText('Informe uma data de hoje ou anterior.'),
    ).toBeInTheDocument();

    expect(registerIncomeMock).not.toHaveBeenCalled();
  });

  it('should render an error message when register income fails', async () => {
    const user = userEvent.setup();

    registerIncomeMock.mockResolvedValueOnce({
      error: 'Não foi possível registrar a receita.',
    });

    render(<IncomeForm />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida Nova');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '100');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    expect(
      await screen.findByText('Não foi possível registrar a receita.'),
    ).toBeInTheDocument();
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup();

    let resolvePromise: (
      value: Awaited<ReturnType<typeof registerIncome>>,
    ) => void;

    registerIncomeMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    render(<IncomeForm />);

    await user.type(screen.getByLabelText(descriptionLabel), 'Corrida Nova');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '100');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    expect(
      screen.getByRole('button', { name: 'Registrando...' }),
    ).toBeDisabled();

    await act(async () => {
      resolvePromise!({
        data: {
          id: 'income-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 100,
          description: 'Corrida Nova',
          date: '2026-04-10',
          categoryId: null,
          notes: null,
          createdAt: '2026-05-07T19:43:27.751Z',
          updatedAt: '2026-05-07T19:43:27.751Z',
        },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Salvar receita' }),
      ).toBeEnabled();
    });
  });
});
