import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CategoryHistoryTable } from '@/modules/reports/presentation/ui/components/category-history-table';
import { buildCategoryHistory } from '@/modules/reports/presentation/ui/utils/category-history';

function months(monthlyLimit: number | null) {
  return buildCategoryHistory({
    entries: [
      { date: '2026-08-10', amount: 1700 },
      { date: '2026-09-10', amount: 900 },
      { date: '2026-10-02', amount: 100 },
    ],
    monthKeys: ['2026-08', '2026-09', '2026-10'],
    currentMonthKey: '2026-10',
    monthlyLimit,
  }).months;
}

describe('CategoryHistoryTable', () => {
  it('should be collapsed behind a toggle that says what it shows', async () => {
    const user = userEvent.setup();
    render(<CategoryHistoryTable categoryName='Combustível' months={months(1500)} hasLimit />);

    const toggle = screen.getByRole('button', { name: 'Ver dados em tabela' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'Ocultar tabela' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('table', { name: 'Gasto mensal de Combustível' })).toBeInTheDocument();
  });

  it('should list each month with its spending and status in words', async () => {
    const user = userEvent.setup();
    render(<CategoryHistoryTable categoryName='Combustível' months={months(1500)} hasLimit />);

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((row) => row.textContent?.replace(/\s/g, ' '))).toEqual([
      expect.stringMatching(/ago\/26.*1\.700,00.*Acima da meta/),
      expect.stringMatching(/set\/26.*900,00.*Dentro da meta/),
      expect.stringMatching(/out\/26.*100,00.*Em andamento \(até hoje\)/),
    ]);
  });

  it('should only show the month status without a goal for the current month', async () => {
    const user = userEvent.setup();
    render(
      <CategoryHistoryTable categoryName='Combustível' months={months(null)} hasLimit={false} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('—');
    expect(rows[2]).toHaveTextContent('Em andamento (até hoje)');
  });
});
