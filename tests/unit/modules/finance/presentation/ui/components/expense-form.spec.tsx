import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const categoryLabel = 'Categoria *';
const descriptionLabel = 'Descrição *';
const amountLabel = 'Valor (R$) *';
const dateLabel = 'Data *';
const notesLabel = 'Observação (opcional)';

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

    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120,50');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');
    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(notesLabel), 'Posto');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

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

    await user.clear(screen.getByLabelText(descriptionLabel));
    await user.type(
      screen.getByLabelText(descriptionLabel),
      'Combustivel atualizado',
    );
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '140');

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

  it('should render editing amount with two decimal places', () => {
    render(
      <ExpenseForm
        categories={categories}
        editingExpense={{
          id: 'expense-id',
          userId: 'user-id',
          type: 'EXPENSE',
          amount: 919.1,
          description: 'Combustivel',
          date: '2026-05-16',
          categoryId: 'category-id',
          notes: null,
          createdAt: '2026-05-16T00:00:00.000Z',
          updatedAt: '2026-05-16T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByLabelText(amountLabel)).toHaveValue('919,10');
  });

  it('should validate future date before submitting', async () => {
    const user = userEvent.setup();

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2999-01-01');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    expect(
      await screen.findByText('Informe uma data de hoje ou anterior.'),
    ).toBeInTheDocument();

    expect(registerExpenseMock).not.toHaveBeenCalled();
  });

  it('should reject an amount above the allowed ceiling', async () => {
    const user = userEvent.setup();

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '1000000000000');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    expect(
      await screen.findByText('Informe um valor de até R$ 999.999.999.999,99.'),
    ).toBeInTheDocument();

    expect(registerExpenseMock).not.toHaveBeenCalled();
  });

  it('should accept an amount at the allowed ceiling', async () => {
    const user = userEvent.setup();

    registerExpenseMock.mockResolvedValueOnce({
      data: {
        id: 'expense-id',
        userId: 'user-id',
        type: 'EXPENSE',
        amount: 999999999999.99,
        description: 'Combustivel',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '999999999999,99');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    await waitFor(() => {
      expect(registerExpenseMock).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 999999999999.99 }),
      );
    });
  });

  it('should reject a description longer than 255 characters', async () => {
    const user = userEvent.setup();

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    fireEvent.change(screen.getByLabelText(descriptionLabel), {
      target: { value: 'a'.repeat(256) },
    });
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    expect(
      await screen.findByText('Descrição deve ter no máximo 255 caracteres.'),
    ).toBeInTheDocument();

    expect(registerExpenseMock).not.toHaveBeenCalled();
  });

  it('should accept a description at exactly 255 characters', async () => {
    const user = userEvent.setup();
    const description = 'a'.repeat(255);

    registerExpenseMock.mockResolvedValueOnce({
      data: {
        id: 'expense-id',
        userId: 'user-id',
        type: 'EXPENSE',
        amount: 120,
        description,
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    fireEvent.change(screen.getByLabelText(descriptionLabel), {
      target: { value: description },
    });
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    await waitFor(() => {
      expect(registerExpenseMock).toHaveBeenCalledWith(
        expect.objectContaining({ description }),
      );
    });
  });

  it('should reject notes longer than 1000 characters', async () => {
    const user = userEvent.setup();

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');
    fireEvent.change(screen.getByLabelText(notesLabel), {
      target: { value: 'a'.repeat(1001) },
    });

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    expect(
      await screen.findByText('Observações devem ter no máximo 1000 caracteres.'),
    ).toBeInTheDocument();

    expect(registerExpenseMock).not.toHaveBeenCalled();
  });

  it('should accept notes at exactly 1000 characters', async () => {
    const user = userEvent.setup();
    const notes = 'a'.repeat(1000);

    registerExpenseMock.mockResolvedValueOnce({
      data: {
        id: 'expense-id',
        userId: 'user-id',
        type: 'EXPENSE',
        amount: 120,
        description: 'Combustivel',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    });

    render(<ExpenseForm categories={categories} />);

    await user.selectOptions(screen.getByLabelText(categoryLabel), 'category-id');
    await user.type(screen.getByLabelText(descriptionLabel), 'Combustivel');
    await user.clear(screen.getByLabelText(amountLabel));
    await user.type(screen.getByLabelText(amountLabel), '120');
    await user.clear(screen.getByLabelText(dateLabel));
    await user.type(screen.getByLabelText(dateLabel), '2026-05-16');
    fireEvent.change(screen.getByLabelText(notesLabel), {
      target: { value: notes },
    });

    await user.click(screen.getByRole('button', { name: 'Salvar despesa' }));

    await waitFor(() => {
      expect(registerExpenseMock).toHaveBeenCalledWith(
        expect.objectContaining({ notes }),
      );
    });
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
    expect(screen.getByRole('button', { name: 'Salvar despesa' })).toBeDisabled();
  });
});
