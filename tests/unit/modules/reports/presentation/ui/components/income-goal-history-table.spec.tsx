import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncomeGoalHistoryTable } from '@/modules/reports/presentation/ui/components/income-goal-history-table';
import { IncomeGoalHistoryMonth } from '@/modules/reports/presentation/ui/utils/income-goal-history';

const months: IncomeGoalHistoryMonth[] = [
  { key: '2026-07', label: 'jul/26', value: 2500, isCurrent: false, status: 'REACHED' },
  { key: '2026-08', label: 'ago/26', value: 900, isCurrent: false, status: 'BELOW' },
  { key: '2026-09', label: 'set/26', value: -300, isCurrent: false, status: 'NEGATIVE' },
  { key: '2026-10', label: 'out/26', value: 800, isCurrent: true, status: 'CURRENT' },
];

describe('IncomeGoalHistoryTable', () => {
  it('should open by keyboard and write each month status in words', async () => {
    const user = userEvent.setup();
    render(<IncomeGoalHistoryTable measure='profit' months={months} hasTarget />);

    const toggle = screen.getByRole('button', { name: 'Ver dados em tabela' });
    toggle.focus();
    await user.keyboard('{Enter}');

    const table = screen.getByRole('table', { name: 'Lucro mensal' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(table).getByRole('columnheader', { name: 'Lucro' })).toBeInTheDocument();
    const rows = within(table).getAllByRole('row').slice(1);
    // formatMoney uses a non-breaking space after R$; compare with plain spaces.
    expect(rows.map((row) => row.textContent?.replace(/\u00a0/g, ' '))).toEqual([
      'jul/26R$ 2.500,00Bateu a meta',
      'ago/26R$ 900,00Abaixo da meta',
      'set/26-R$ 300,00No vermelho',
      'out/26R$ 800,00Em andamento (até hoje)',
    ]);
  });

  it('should show a dash for closed months without a goal', async () => {
    const user = userEvent.setup();
    render(
      <IncomeGoalHistoryTable
        measure='revenue'
        months={[{ ...months[0], status: 'NONE' }]}
        hasTarget={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    expect(screen.getByRole('table', { name: 'Faturamento mensal' })).toHaveTextContent('—');
  });
});
