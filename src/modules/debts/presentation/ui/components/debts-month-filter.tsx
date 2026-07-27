import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';

import {
  formatMonthLabel,
  getCurrentMonthValue,
  getNextMonthValue,
  getPreviousMonthValue,
} from '../utils/debt-filters';

type DebtsMonthFilterProps = {
  month: string;
  onMonthChange: (month: string) => void;
};

export function DebtsMonthFilter({
  month,
  onMonthChange,
}: DebtsMonthFilterProps) {
  const isCurrentMonth = month === getCurrentMonthValue();

  return (
    <div className='flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 lg:w-auto'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='secondary'
          aria-label='Mês anterior'
          className='size-9 rounded-lg p-0'
          onClick={() => onMonthChange(getPreviousMonthValue(month))}
        >
          <ChevronLeft aria-hidden='true' className='size-4' />
        </Button>

        <span className='min-w-40 text-center text-sm font-semibold text-foreground'>
          {formatMonthLabel(month)}
        </span>

        <Button
          type='button'
          variant='secondary'
          aria-label='Próximo mês'
          className='size-9 rounded-lg p-0'
          onClick={() => onMonthChange(getNextMonthValue(month))}
        >
          <ChevronRight aria-hidden='true' className='size-4' />
        </Button>
      </div>

      {!isCurrentMonth && (
        <Button
          type='button'
          variant='secondary'
          className='h-9 rounded-lg px-3 text-sm'
          onClick={() => onMonthChange(getCurrentMonthValue())}
        >
          <RotateCcw aria-hidden='true' className='size-4' />
          Mês atual
        </Button>
      )}
    </div>
  );
}
