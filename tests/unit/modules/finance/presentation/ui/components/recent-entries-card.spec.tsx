import { render, screen, within } from '@testing-library/react';

import { RecentEntriesCard } from '@/modules/finance/presentation/ui/components/recent-entries-card';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

function entry(overrides: Partial<FinanceEntryUi>): FinanceEntryUi {
  return {
    id: 'entry-1',
    userId: 'user-1',
    type: 'INCOME',
    amount: 100,
    description: 'Diária',
    date: '2026-10-31T00:00:00.000Z',
    categoryId: null,
    debtId: null,
    notes: null,
    createdAt: '2026-10-31T12:00:00.000Z',
    updatedAt: '2026-10-31T12:00:00.000Z',
    ...overrides,
  };
}

describe('RecentEntriesCard', () => {
  it('should render the heading', () => {
    render(<RecentEntriesCard entries={[]} />);

    expect(screen.getByRole('heading', { name: 'Transações recentes' })).toBeInTheDocument();
  });

  // Recent entries come from any month, so an empty list means no entries at
  // all, not none this month.
  it('should say there are no entries yet when the list is empty', () => {
    render(<RecentEntriesCard entries={[]} />);

    expect(screen.getByText('Nenhuma transação registrada ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver todas as transações' })).not.toBeInTheDocument();
  });

  it('should show incomes as received and expenses as paid, with a minus sign', () => {
    const { container } = render(
      <RecentEntriesCard
        entries={[
          entry({ id: 'income', description: 'Diária uber', amount: 187.69 }),
          entry({ id: 'expense', type: 'EXPENSE', description: 'Abastecimento', amount: 150, categoryId: 'cat' }),
        ]}
      />,
    );

    // The desktop table (the mobile list repeats the same entries).
    const table = container.querySelector('.lg\\:block') as HTMLElement;
    const incomeRow = within(table).getByText('Diária uber').closest('div.grid') as HTMLElement;
    const expenseRow = within(table).getByText('Abastecimento').closest('div.grid') as HTMLElement;

    expect(incomeRow).toHaveTextContent('Recebido');
    expect(incomeRow.textContent).not.toMatch(/-R\$/);
    expect(expenseRow).toHaveTextContent('Pago');
    expect(expenseRow.textContent).toMatch(/-R\$/);
  });

  it('should link to the full history', () => {
    render(<RecentEntriesCard entries={[entry({})]} />);

    expect(screen.getByRole('link', { name: 'Ver todas as transações' })).toHaveAttribute(
      'href',
      '/finance/history',
    );
  });
});
