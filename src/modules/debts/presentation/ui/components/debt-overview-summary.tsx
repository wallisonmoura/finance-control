import Link from 'next/link';
import { CheckCircle2, CircleDollarSign, ListChecks, Plus } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
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
    <div className='space-y-5'>
      <section className='overflow-hidden rounded-xl bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#020617_0%,#06152f_56%,#042f2e_100%)] p-5 text-white shadow-xl shadow-slate-200/80 ring-1 ring-white/10 sm:p-6 xl:p-8'>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center xl:grid-cols-[1.15fr_1.5fr]'>
          <div>
            <div className='flex items-center gap-3 text-sm font-medium text-white'>
              <span className='flex size-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/30'>
                <CircleDollarSign aria-hidden='true' className='size-6' />
              </span>
              Valor pendente
            </div>

            <MoneyDisplay
              value={pendingTotal}
              className='mt-5 text-4xl font-bold !text-white sm:text-5xl'
            />

            <p className='mt-3 text-sm text-white/85'>
              {pendingDebts.length}{' '}
              {pendingDebts.length === 1
                ? 'compromisso financeiro ainda em aberto.'
                : 'compromissos financeiros ainda em aberto.'}
            </p>
          </div>

          <div className='grid border-t border-white/15 pt-5 lg:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 xl:grid-cols-3 xl:pl-8'>
            <div className='border-white/15 pb-5 lg:border-r lg:pb-0 lg:pr-5'>
              <CircleDollarSign
                aria-hidden='true'
                className='size-7 text-orange-400'
              />
              <p className='mt-4 text-sm text-white/80'>Dívidas pendentes</p>
              <strong className='mt-3 block text-3xl font-bold'>
                {pendingDebts.length}
              </strong>
            </div>

            <div className='border-t border-white/15 py-5 lg:border-t-0 lg:py-0 lg:pl-5 xl:border-r xl:pr-5'>
              <CheckCircle2
                aria-hidden='true'
                className='size-7 text-emerald-400'
              />
              <p className='mt-4 text-sm text-white/80'>Dívidas pagas</p>
              <strong className='mt-3 block text-3xl font-bold'>
                {paidDebts.length}
              </strong>
            </div>

            <div className='border-t border-white/15 pt-5 lg:col-span-2 lg:mt-5 xl:col-span-1 xl:mt-0 xl:border-t-0 xl:pt-0 xl:pl-5'>
              <CircleDollarSign
                aria-hidden='true'
                className='size-7 text-emerald-400'
              />
              <p className='mt-4 text-sm text-white/80'>Valor pago</p>
              <MoneyDisplay
                value={paidTotal}
                className='mt-3 text-2xl font-bold !text-white'
              />
            </div>
          </div>
        </div>
      </section>

      <div className='grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:flex lg:flex-wrap lg:justify-end'>
        <Button
          asChild
          variant='secondary'
          className='h-12 w-full justify-center lg:w-44'
        >
          <Link href='/debts/pending'>
            <ListChecks aria-hidden='true' className='size-4' />
            Ver pendentes
          </Link>
        </Button>

        <Button
          asChild
          variant='secondary'
          className='h-12 w-full justify-center lg:w-44'
        >
          <Link href='/debts/paid'>
            <CheckCircle2 aria-hidden='true' className='size-4' />
            Ver pagas
          </Link>
        </Button>

        <Button
          type='button'
          onClick={onCreateDebt}
          className='h-12 w-full justify-center px-6 lg:w-44'
        >
          <Plus aria-hidden='true' className='size-4' />
          Nova dívida
        </Button>
      </div>
    </div>
  );
}
