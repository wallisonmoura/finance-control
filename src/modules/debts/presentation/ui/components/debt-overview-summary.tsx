import Link from 'next/link';
import { CheckCircle2, ListChecks, Plus } from 'lucide-react';

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
      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        <Card>
          <p className='text-sm text-slate-500'>Dívidas pendentes</p>
          <strong className='mt-2 block text-xl font-bold text-slate-950 sm:text-2xl'>
            {pendingDebts.length}
          </strong>
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Valor pendente</p>
          <MoneyDisplay
            value={pendingTotal}
            className='mt-2 text-xl font-bold text-red-700 sm:text-2xl'
          />
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Dívidas pagas</p>
          <strong className='mt-2 block text-xl font-bold text-slate-950 sm:text-2xl'>
            {paidDebts.length}
          </strong>
        </Card>

        <Card>
          <p className='text-sm text-slate-500'>Valor pago</p>
          <MoneyDisplay
            value={paidTotal}
            className='mt-2 text-xl font-bold text-emerald-700 sm:text-2xl'
          />
        </Card>
      </div>

      <div className='grid gap-2 sm:flex sm:flex-wrap sm:justify-end'>
        <Button asChild variant='secondary' className='w-full sm:w-auto'>
          <Link href='/debts/pending'>
            <ListChecks aria-hidden='true' className='size-4' />
            Ver pendentes
          </Link>
        </Button>

        <Button asChild variant='secondary' className='w-full sm:w-auto'>
          <Link href='/debts/paid'>
            <CheckCircle2 aria-hidden='true' className='size-4' />
            Ver pagas
          </Link>
        </Button>

        <Button
          type='button'
          onClick={onCreateDebt}
          className='w-full sm:w-auto'
        >
          <Plus aria-hidden='true' className='size-4' />
          Nova dívida
        </Button>
      </div>
    </div>
  );
}
