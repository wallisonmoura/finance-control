import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ClipboardList,
} from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

type FinanceHistorySummaryProps = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalEntries: number;
};

export function FinanceHistorySummary({
  totalIncome,
  totalExpense,
  balance,
  totalEntries,
}: FinanceHistorySummaryProps) {
  const balanceClassName = balance >= 0 ? 'text-info' : 'text-expense';

  return (
    <Card className='p-0'>
      <div className='grid gap-0 lg:grid-cols-2 xl:grid-cols-4'>
        <div className='flex items-center gap-4 p-5'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-income-muted text-income'>
            <ArrowUp aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              Total de receitas
            </p>
            <MoneyDisplay
              value={totalIncome}
              className='mt-1 text-2xl font-bold text-income'
            />
            <p className='mt-1 text-sm text-muted-foreground'>
              Entradas no período
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 lg:border-t-0 lg:border-l xl:border-l'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-expense-muted text-expense'>
            <ArrowDown aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              Total de despesas
            </p>
            <MoneyDisplay
              value={totalExpense}
              className='mt-1 text-2xl font-bold text-expense'
            />
            <p className='mt-1 text-sm text-muted-foreground'>
              Saídas no período
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 xl:border-t-0 xl:border-l'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-info-muted text-info'>
            <ArrowLeftRight aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              Saldo no período
            </p>
            <MoneyDisplay
              value={balance}
              className={`mt-1 text-2xl font-bold ${balanceClassName}`}
            />
            <p className='mt-1 text-sm text-muted-foreground'>
              Receitas - despesas
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 lg:border-l xl:border-t-0'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <ClipboardList aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              Total de movimentações
            </p>
            <strong className='mt-1 block text-2xl font-bold text-foreground'>
              {totalEntries}
            </strong>
            <p className='mt-1 text-sm text-muted-foreground'>
              {totalEntries === 1 ? 'registro' : 'registros'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
