import { render, screen } from '@testing-library/react';

import { FinanceHistoryList } from '@/modules/finance/presentation/ui/components/finance-history-list';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

describe('FinanceHistoryList', () => {
  it('should render empty state when there are no entries', () => {
    render(<FinanceHistoryList entries={[]} />);

    expect(
      screen.getByText(
        'Nenhum lançamento encontrado para o período selecionado.',
      ),
    ).toBeInTheDocument();
  });

  it('should render finance entries', () => {
    const entries: FinanceEntryUi[] = [
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
    ];

    render(<FinanceHistoryList entries={entries} />);

    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('ganho uber')).toBeInTheDocument();
    expect(screen.getByText('abastecimento gasolina')).toBeInTheDocument();

    expect(screen.getByText(/Receita ·/)).toBeInTheDocument();
    expect(screen.getByText(/Despesa ·/)).toBeInTheDocument();

    expect(screen.getByText('UBER')).toBeInTheDocument();

    expect(screen.getByText('R$ 400,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
  });
});
