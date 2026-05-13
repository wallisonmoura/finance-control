import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncomeForm } from '@/modules/finance/presentation/ui/components/income-form';
import { registerIncome } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock(
  '@/modules/finance/presentation/ui/services/finance-api.service',
  () => ({
    registerIncome: jest.fn(),
  }),
);

const registerIncomeMock = registerIncome as jest.MockedFunction<
  typeof registerIncome
>;

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

    await user.type(screen.getByLabelText('Descrição'), 'Corrida Nova');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '400,50');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-04-10');
    await user.type(screen.getByLabelText('Observações'), 'Pagamento PIX');

    await user.click(screen.getByRole('button', { name: 'Registrar receita' }));

    await waitFor(() => {
      expect(registerIncomeMock).toHaveBeenCalledWith({
        amount: 400.5,
        description: 'Corrida Nova',
        date: '2026-04-10',
        notes: 'Pagamento PIX',
      });
    });

    expect(onIncomeCreated).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Receita registrada com sucesso.'),
    ).toBeInTheDocument();
  });

  it('should send notes as null when notes is empty', async () => {
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

    await user.type(screen.getByLabelText('Descrição'), 'Corrida');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '100');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Registrar receita' }));

    await waitFor(() => {
      expect(registerIncomeMock).toHaveBeenCalledWith({
        amount: 100,
        description: 'Corrida',
        date: '2026-04-10',
        notes: null,
      });
    });
  });

  it('should render an error message when register income fails', async () => {
    const user = userEvent.setup();

    registerIncomeMock.mockResolvedValueOnce({
      error: 'Amount must be greater than zero.',
    });

    render(<IncomeForm />);

    await user.type(screen.getByLabelText('Descrição'), 'Corrida Nova');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '0');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Registrar receita' }));

    expect(
      await screen.findByText('Amount must be greater than zero.'),
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

    await user.type(screen.getByLabelText('Descrição'), 'Corrida Nova');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '100');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-04-10');

    await user.click(screen.getByRole('button', { name: 'Registrar receita' }));

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
        screen.getByRole('button', { name: 'Registrar receita' }),
      ).toBeEnabled();
    });
  });
});
