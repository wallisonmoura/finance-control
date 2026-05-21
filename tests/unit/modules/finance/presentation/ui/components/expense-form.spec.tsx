import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpenseForm } from '@/modules/finance/presentation/ui/components/expense-form';
import {
  registerExpense,
  updateExpense,
} from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock(
  '@/modules/finance/presentation/ui/services/finance-api.service',
  () => ({
    registerExpense: jest.fn(),
    updateExpense: jest.fn(),
  }),
);

const registerExpenseMock = jest.mocked(registerExpense);
const updateExpenseMock = jest.mocked(updateExpense);

const categories = [
  {
    id: 'category-id',
    name: 'Combustivel',
    slug: 'combustivel',
  },
];

describe('ExpenseForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register an expense successfully', async () => {
    const user = userEvent.setup();
    const onExpenseCreated = jest.fn();

    registerExpenseMock.mockResolvedValueOnce({
      data: {
        id: 'expense-id',
        userId: 'user-id',
        type: 'EXPENSE',
        amount: 120.5,
        description: 'Combustivel',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: 'Posto',
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(
      <ExpenseForm
        categories={categories}
        onExpenseCreated={onExpenseCreated}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'Combustivel');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '120,50');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-05-16');
    await user.selectOptions(screen.getByLabelText('Categoria'), 'category-id');
    await user.type(screen.getByLabelText('Observações'), 'Posto');

    await user.click(screen.getByRole('button', { name: 'Registrar despesa' }));

    await waitFor(() => {
      expect(registerExpenseMock).toHaveBeenCalledWith({
        amount: 120.5,
        description: 'Combustivel',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: 'Posto',
      });
    });

    expect(onExpenseCreated).toHaveBeenCalledTimes(1);
  });

  it('should update an expense successfully', async () => {
    const user = userEvent.setup();
    const onExpenseUpdated = jest.fn();

    updateExpenseMock.mockResolvedValueOnce({
      data: {
        id: 'expense-id',
        userId: 'user-id',
        type: 'EXPENSE',
        amount: 140,
        description: 'Combustivel atualizado',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(
      <ExpenseForm
        categories={categories}
        editingExpense={{
          id: 'expense-id',
          userId: 'user-id',
          type: 'EXPENSE',
          amount: 120,
          description: 'Combustivel',
          date: '2026-05-16',
          categoryId: 'category-id',
          notes: null,
          createdAt: '2026-05-16T00:00:00.000Z',
          updatedAt: '2026-05-16T00:00:00.000Z',
        }}
        onExpenseUpdated={onExpenseUpdated}
      />,
    );

    await user.clear(screen.getByLabelText('Descrição'));
    await user.type(screen.getByLabelText('Descrição'), 'Combustivel atualizado');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '140');

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => {
      expect(updateExpenseMock).toHaveBeenCalledWith('expense-id', {
        amount: 140,
        description: 'Combustivel atualizado',
        date: '2026-05-16',
        categoryId: 'category-id',
      });
    });

    expect(onExpenseUpdated).toHaveBeenCalledTimes(1);
  });

  it('should render category loading error', () => {
    render(
      <ExpenseForm
        categories={[]}
        categoriesError='Não foi possível carregar categorias.'
      />,
    );

    expect(
      screen.getByText('Não foi possível carregar categorias.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar despesa' })).toBeDisabled();
  });
});
