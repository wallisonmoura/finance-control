import { ChartNoAxesCombined, TrendingDown, TrendingUp } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

type FinanceHistorySummaryProps = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function FinanceHistorySummary({
  totalIncome,
  totalExpense,
  balance,
}: FinanceHistorySummaryProps) {
  const balanceClassName = balance >= 0 ? 'text-emerald-700' : 'text-red-700';

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <div className='flex items-center gap-2 text-sm text-slate-500'>
          <TrendingUp aria-hidden='true' className='size-4 text-emerald-600' />
          <p>Receitas do período</p>
        </div>
        <div className='mt-2'>
          <MoneyDisplay value={totalIncome} className='text-emerald-700' />
        </div>
      </Card>

      <Card>
        <div className='flex items-center gap-2 text-sm text-slate-500'>
          <TrendingDown aria-hidden='true' className='size-4 text-red-600' />
          <p>Despesas do período</p>
        </div>
        <div className='mt-2'>
          <MoneyDisplay value={totalExpense} className='text-red-700' />
        </div>
      </Card>

      <Card>
        <div className='flex items-center gap-2 text-sm text-slate-500'>
          <ChartNoAxesCombined
            aria-hidden='true'
            className={`size-4 ${
              balance >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          />
          <p>Resultado do período</p>
        </div>
        <div className='mt-2'>
          <MoneyDisplay value={balance} className={balanceClassName} />
        </div>
      </Card>
    </div>
  );
}
