import Link from 'next/link';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { DebtUi } from '../types/debt-ui.types';

type DebtOverviewSummaryProps = {
  debts: DebtUi[];
  onCreateDebt: () => void;
};

function sumDebts(debts: DebtUi[]) {
  return debts.reduce((total, debt) => total + debt.amount, 0);
}

export function DebtOverviewSummary({
  debts,
  onCreateDebt,
}: DebtOverviewSummaryProps) {
  const pendingDebts = debts.filter((debt) => debt.status === 'PENDING');
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  const pendingTotal = sumDebts(pendingDebts);
  const paidTotal = sumDebts(paidDebts);

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <Card>
          <p className='text-sm text-slate-500'>Dívidas pendentes</p>
          <strong className='mt-2 block text-2xl font-bold text-slate-950'>
            {pendingDebts.length}
          </strong>
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Valor pendente</p>
          <MoneyDisplay
            value={pendingTotal}
            className='mt-2 text-2xl font-bold text-red-700'
          />
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Dívidas pagas</p>
          <strong className='mt-2 block text-2xl font-bold text-slate-950'>
            {paidDebts.length}
          </strong>
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Valor pago</p>
          <MoneyDisplay
            value={paidTotal}
            className='mt-2 text-2xl font-bold text-emerald-700'
          />
        </Card>
      </div>

      <div className='flex flex-wrap justify-end gap-2'>
        <Link
          href='/debts/pending'
          className='rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2'
        >
          Ver pendentes
        </Link>

        <Link
          href='/debts/paid'
          className='rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2'
        >
          Ver pagas
        </Link>

        <Button type='button' onClick={onCreateDebt}>
          Nova divida
        </Button>
      </div>
    </div>
  );
}
