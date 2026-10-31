'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { cn } from '@/shared/presentation/ui/lib/utils';

type ChartDataTableColumn = {
  header: string;
  align?: 'left' | 'right';
};

type ChartDataTableRow = {
  key: string;
  // The first cell names the row (month, category) and becomes its header.
  cells: ReactNode[];
};

type ChartDataTableProps = {
  caption: string;
  columns: ChartDataTableColumn[];
  rows: ChartDataTableRow[];
};

// A chart's data as a table, behind a toggle: readable by screen readers and
// by anyone who cannot tell the bars apart (same pattern as the history
// tables).
export function ChartDataTable({ caption, columns, rows }: ChartDataTableProps) {
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
          <caption className='sr-only'>{caption}</caption>
          <thead>
            <tr className='border-b border-border text-xs text-muted-foreground'>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope='col'
                  className={cn('py-2 font-medium', column.align === 'right' ? 'text-right' : 'text-left')}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className='border-b border-border last:border-0'>
                {row.cells.map((cell, index) =>
                  index === 0 ? (
                    <th key={index} scope='row' className='py-2 text-left font-medium text-foreground'>
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={cn(
                        'py-2 text-foreground',
                        columns[index]?.align === 'right' ? 'text-right' : 'text-left',
                      )}
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
