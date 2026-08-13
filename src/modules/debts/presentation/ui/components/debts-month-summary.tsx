import { BanknoteX, CircleX } from 'lucide-react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { DebtUi } from '../types/debts-ui.types';
import { sumDebtAmounts } from '../utils/debt-amounts';

type DebtsMonthSummaryProps = {
  debts: DebtUi[];
};

export function DebtsMonthSummary({ debts }: DebtsMonthSummaryProps) {
  const pendingDebts = debts.filter((debt) => debt.status === 'PENDING');
  const pendingTotal = sumDebtAmounts(pendingDebts);

  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      <div className='flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning ring-1 ring-warning/30'>
          <BanknoteX aria-hidden='true' className='size-4' />
        </span>
        <div>
          <p className='text-xs text-muted-foreground'>
            Valor pendente no mês
          </p>
          <MoneyDisplay
            value={pendingTotal}
            className='text-lg font-bold text-foreground'
          />
        </div>
      </div>

      <div className='flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning ring-1 ring-warning/30'>
          <CircleX aria-hidden='true' className='size-4' />
        </span>
        <div>
          <p className='text-xs text-muted-foreground'>
            Dívidas pendentes no mês
          </p>
          <strong className='block text-lg font-bold text-foreground'>
            {pendingDebts.length}
          </strong>
        </div>
      </div>
    </div>
  );
}
