'use client';

import { useId, useState } from 'react';

import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { Button } from '@/shared/presentation/ui/components/button';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { INCOME_GOAL_HISTORY_COPY } from '../utils/income-goal-history-copy';
import { IncomeGoalHistoryMonth, IncomeGoalMonthStatus } from '../utils/income-goal-history';

const STATUS_LABEL: Record<IncomeGoalMonthStatus, string> = {
  CURRENT: 'Em andamento (até hoje)',
  REACHED: 'Bateu a meta',
  BELOW: 'Abaixo da meta',
  NEGATIVE: 'No vermelho',
  NONE: '—',
};

const STATUS_CLASS_NAME: Record<IncomeGoalMonthStatus, string> = {
  CURRENT: 'text-muted-foreground',
  REACHED: 'font-semibold text-income',
  BELOW: 'text-muted-foreground',
  NEGATIVE: 'font-semibold text-expense',
  NONE: 'text-muted-foreground',
};

type IncomeGoalHistoryTableProps = {
  measure: IncomeGoalKind;
  months: IncomeGoalHistoryMonth[];
};

// The chart's data as a table: readable by screen readers and the place that
// says, without relying on color, which months reached the goal.
export function IncomeGoalHistoryTable({ measure, months }: IncomeGoalHistoryTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tableId = useId();
  const copy = INCOME_GOAL_HISTORY_COPY[measure];

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
          <caption className='sr-only'>{copy.valueLabel} mensal</caption>
          <thead>
            <tr className='border-b border-border text-left text-xs text-muted-foreground'>
              <th scope='col' className='py-2 font-medium'>Mês</th>
              <th scope='col' className='py-2 text-right font-medium'>{copy.valueLabel}</th>
              <th scope='col' className='py-2 pl-4 font-medium'>Situação</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key} className='border-b border-border last:border-0'>
                <th scope='row' className='py-2 text-left font-medium text-foreground'>
                  {month.label}
                </th>
                <td className='py-2 text-right text-foreground'>{formatMoney(month.value)}</td>
                <td className={`py-2 pl-4 ${STATUS_CLASS_NAME[month.status]}`}>
                  {STATUS_LABEL[month.status]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
