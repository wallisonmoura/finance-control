import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FinanceHistoryList } from '@/modules/finance/presentation/ui/components/finance-history-list';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

const singleEntry: FinanceEntryUi[] = [
  {
    id: 'income-id',
    userId: 'user-id',
    type: 'INCOME',
    amount: 400,
    description: 'ganho uber',
    date: '2026-05-05T00:00:00.000Z',
    categoryId: null,
    notes: null,
    createdAt: '2026-05-07T20:12:15.498Z',
    updatedAt: '2026-05-07T20:12:15.498Z',
  },
];

describe('FinanceHistoryList', () => {
  it('should render empty state when there are no entries', () => {
    render(<FinanceHistoryList entries={[]} />);

    expect(
      screen.getByText(/Nenhum lançamento encontrado/i),
    ).toBeInTheDocument();
  });

  it('should render finance entries', () => {
    render(
      <FinanceHistoryList
        categories={[
          { id: 'category-id', name: 'Abastecimento', slug: 'abastecimento' },
        ]}
        entries={[
          {
            id: 'income-id',
            userId: 'user-id',
            type: 'INCOME',
            amount: 400,
            description: 'ganho uber',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: null,
            notes: 'UBER',
            createdAt: '2026-05-07T20:12:15.498Z',
            updatedAt: '2026-05-07T20:12:15.498Z',
          },
          {
            id: 'expense-id',
            userId: 'user-id',
            type: 'EXPENSE',
            amount: 50,
            description: 'abastecimento gasolina',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: 'category-id',
            notes: null,
            createdAt: '2026-05-07T20:13:50.343Z',
            updatedAt: '2026-05-07T20:13:50.343Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('ganho uber')).toBeInTheDocument();
    expect(screen.getByText('abastecimento gasolina')).toBeInTheDocument();

    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText('Despesa')).toBeInTheDocument();

    expect(screen.getByText('UBER')).toBeInTheDocument();
    expect(screen.getByText(/Categoria: Abastecimento/i)).toBeInTheDocument();
    expect(screen.queryByText(/category-id/i)).not.toBeInTheDocument();
  });

  it('should not render the raw category id when the category is unknown', () => {
    render(
      <FinanceHistoryList
        categories={[]}
        entries={[
          {
            id: 'expense-id',
            userId: 'user-id',
            type: 'EXPENSE',
            amount: 50,
            description: 'abastecimento gasolina',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: 'category-id',
            notes: null,
            createdAt: '2026-05-07T20:13:50.343Z',
            updatedAt: '2026-05-07T20:13:50.343Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('abastecimento gasolina')).toBeInTheDocument();
    expect(screen.queryByText(/Categoria:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/category-id/i)).not.toBeInTheDocument();
  });

  it('should render income actions when callbacks are provided', () => {
    const onEditIncome = jest.fn();
    const onDeleteIncome = jest.fn();

    render(
      <FinanceHistoryList
        entries={[
          {
            id: 'income-id',
            userId: 'user-id',
            type: 'INCOME',
            amount: 400,
            description: 'ganho uber',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: null,
            notes: null,
            createdAt: '2026-05-07T20:12:15.498Z',
            updatedAt: '2026-05-07T20:12:15.498Z',
          },
        ]}
        onEditIncome={onEditIncome}
        onDeleteIncome={onDeleteIncome}
      />,
    );

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('should not render actions for expense entries', () => {
    render(
      <FinanceHistoryList
        entries={[
          {
            id: 'expense-id',
            userId: 'user-id',
            type: 'EXPENSE',
            amount: 50,
            description: 'abastecimento gasolina',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: 'category-id',
            notes: null,
            createdAt: '2026-05-07T20:13:50.343Z',
            updatedAt: '2026-05-07T20:13:50.343Z',
          },
        ]}
        onEditIncome={jest.fn()}
        onDeleteIncome={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument();
  });

  it('should not render actions for debt payment expense entries', () => {
    render(
      <FinanceHistoryList
        entries={[
          {
            id: 'expense-id',
            userId: 'user-id',
            type: 'EXPENSE',
            amount: 50,
            description: 'Pagamento de dívida: seguro',
            date: '2026-05-05T00:00:00.000Z',
            categoryId: 'category-id',
            debtId: 'debt-id',
            notes: null,
            createdAt: '2026-05-07T20:13:50.343Z',
            updatedAt: '2026-05-07T20:13:50.343Z',
          },
        ]}
        onEditExpense={jest.fn()}
        onDeleteExpense={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Gerada por pagamento de dívida.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument();
  });

  it('should render the page range built from pagination', () => {
    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 1, pageSize: 20, totalCount: 143, totalPages: 8 }}
      />,
    );

    expect(
      screen.getByText('Mostrando 1–20 de 143 movimentações'),
    ).toBeInTheDocument();
  });

  it('should hide pagination controls when there is only one page', () => {
    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 1, pageSize: 20, totalCount: 1, totalPages: 1 }}
      />,
    );

    expect(
      screen.getByText('Mostrando 1–1 de 1 movimentação'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Página anterior' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Próxima página' }),
    ).not.toBeInTheDocument();
  });

  it('should not render pagination controls or range when pagination is not provided', () => {
    render(<FinanceHistoryList entries={singleEntry} />);

    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it('should disable the previous button on the first page and call onPageChange for the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 1, pageSize: 20, totalCount: 40, totalPages: 2 }}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable the next button on the last page and call onPageChange for the previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 2, pageSize: 20, totalCount: 40, totalPages: 2 }}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange when a page number button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 1, pageSize: 20, totalCount: 60, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Página 3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should collapse far-away pages into an ellipsis window for large totalPages', () => {
    render(
      <FinanceHistoryList
        entries={singleEntry}
        pagination={{ page: 5, pageSize: 20, totalCount: 200, totalPages: 10 }}
        onPageChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 10' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Página 2' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Página 8' }),
    ).not.toBeInTheDocument();
  });
});
