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
  const balanceClassName = balance >= 0 ? '!text-blue-700' : '!text-red-700';

  return (
    <Card className='p-0'>
      <div className='grid gap-0 divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0'>
        <div className='flex items-center gap-4 p-5'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
            <ArrowUp aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              Total de receitas
            </p>
            <MoneyDisplay
              value={totalIncome}
              className='mt-1 text-2xl font-bold !text-emerald-700'
            />
            <p className='mt-1 text-sm text-slate-500'>Entradas no período</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-5'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600'>
            <ArrowDown aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              Total de despesas
            </p>
            <MoneyDisplay
              value={totalExpense}
              className='mt-1 text-2xl font-bold !text-red-700'
            />
            <p className='mt-1 text-sm text-slate-500'>Saídas no período</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-5'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
            <ArrowLeftRight aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              Saldo no período
            </p>
            <MoneyDisplay
              value={balance}
              className={`mt-1 text-2xl font-bold ${balanceClassName}`}
            />
            <p className='mt-1 text-sm text-slate-500'>Receitas - despesas</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-5'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600'>
            <ClipboardList aria-hidden='true' className='size-6' />
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              Total de movimentações
            </p>
            <strong className='mt-1 block text-2xl font-bold text-slate-950'>
              {totalEntries}
            </strong>
            <p className='mt-1 text-sm text-slate-500'>
              {totalEntries === 1 ? 'registro' : 'registros'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
