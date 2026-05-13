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
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <p className='text-sm text-slate-500'>Receitas do período</p>
        <div className='mt-2'>
          <MoneyDisplay value={totalIncome} />
        </div>
      </Card>

      <Card>
        <p className='text-sm text-slate-500'>Despesas do período</p>
        <div className='mt-2'>
          <MoneyDisplay value={totalExpense} />
        </div>
      </Card>

      <Card>
        <p className='text-sm text-slate-500'>Resultado do período</p>
        <div className='mt-2'>
          <MoneyDisplay value={balance} />
        </div>
      </Card>
    </div>
  );
}
