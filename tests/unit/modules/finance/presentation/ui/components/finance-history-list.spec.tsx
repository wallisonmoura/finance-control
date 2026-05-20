import { render, screen } from '@testing-library/react';

import { FinanceHistoryList } from '@/modules/finance/presentation/ui/components/finance-history-list';

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
    expect(screen.getByText(/Categoria: category-id/i)).toBeInTheDocument();
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
});
