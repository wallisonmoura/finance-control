'use client';

import { useId, useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { CategoryHistoryMonth } from '../utils/category-history';

type CategoryHistoryTableProps = {
  categoryName: string;
  months: CategoryHistoryMonth[];
  hasLimit: boolean;
};

function statusOf(month: CategoryHistoryMonth, hasLimit: boolean): string {
  if (month.isCurrent) {
    return 'Em andamento (até hoje)';
  }

  if (!hasLimit) {
    return '—';
  }

  return month.overLimit ? 'Acima da meta' : 'Dentro da meta';
}

// The chart's data as a table: readable by screen readers and the only place
// that says, without relying on color, which months went over the goal.
export function CategoryHistoryTable({
  categoryName,
  months,
  hasLimit,
}: CategoryHistoryTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tableId = useId();

  return (
    <div className='mt-4'>
      <Button
        type='button'
        variant='ghost'
        className='h-8 px-2 text-xs'
        aria-expanded={isOpen}
        aria-controls={tableId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? 'Ocultar tabela' : 'Ver dados em tabela'}
      </Button>

      {isOpen && (
        <table id={tableId} className='mt-2 w-full text-sm'>
          <caption className='sr-only'>Gasto mensal de {categoryName}</caption>
          <thead>
            <tr className='border-b border-border text-left text-xs text-muted-foreground'>
              <th scope='col' className='py-2 font-medium'>Mês</th>
              <th scope='col' className='py-2 text-right font-medium'>Gasto</th>
              <th scope='col' className='py-2 pl-4 font-medium'>Situação</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key} className='border-b border-border last:border-0'>
                <th scope='row' className='py-2 text-left font-medium text-foreground'>
                  {month.label}
                </th>
                <td className='py-2 text-right text-foreground'>{formatMoney(month.total)}</td>
                <td
                  className={
                    month.overLimit
                      ? 'py-2 pl-4 font-semibold text-expense'
                      : 'py-2 pl-4 text-muted-foreground'
                  }
                >
                  {statusOf(month, hasLimit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
