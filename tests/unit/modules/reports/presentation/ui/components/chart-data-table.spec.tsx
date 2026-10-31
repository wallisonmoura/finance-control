import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChartDataTable } from '@/modules/reports/presentation/ui/components/chart-data-table';

function renderTable() {
  render(
    <ChartDataTable
      caption='Receita e despesa por mês'
      columns={[{ header: 'Mês' }, { header: 'Receita', align: 'right' }]}
      rows={[
        { key: '2026-09', cells: ['set/26', 'R$ 3.000,00'] },
        { key: '2026-10', cells: ['out/26', 'R$ 1.000,00'] },
      ]}
    />,
  );
}

describe('ChartDataTable', () => {
  it('should keep the table closed until asked', () => {
    renderTable();

    expect(screen.getByRole('button', { name: 'Ver dados em tabela' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should open the chart data as a captioned table with row headers', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: 'Ver dados em tabela' }));

    const table = screen.getByRole('table', { name: 'Receita e despesa por mês' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Mês',
      'Receita',
    ]);
    expect(within(table).getByRole('rowheader', { name: 'out/26' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'R$ 3.000,00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar tabela' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
