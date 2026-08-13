import { CheckCircle2, CircleX, BanknoteX, BanknoteArrowDown } from 'lucide-react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { DebtUi } from '../types/debts-ui.types';
import { sumDebtAmounts } from '../utils/debt-amounts';

type DebtOverviewSummaryProps = {
  debts: DebtUi[];
};

export function DebtOverviewSummary({ debts }: DebtOverviewSummaryProps) {
  const pendingDebts = debts.filter((debt) => debt.status === 'PENDING');
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  const pendingTotal = sumDebtAmounts(pendingDebts);
  const paidTotal = sumDebtAmounts(paidDebts);

  return (
    <section className='overflow-hidden rounded-xl bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#020617_0%,#06152f_56%,#042f2e_100%)] p-5 text-primary-foreground shadow-xl shadow-border/80 ring-1 ring-primary-foreground/10 sm:p-6 xl:p-8'>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center xl:grid-cols-[1.15fr_1.5fr]'>
        <div>
          <div className='flex items-center gap-3 text-sm font-medium text-primary-foreground'>
            <span className='flex size-10 items-center justify-center rounded-full bg-warning/15 text-warning ring-1 ring-warning/30'>
              <BanknoteX aria-hidden='true' className='size-6' />
            </span>
            Valor pendente
          </div>

          <MoneyDisplay
            value={pendingTotal}
            className='mt-5 text-4xl font-bold text-primary-foreground sm:text-5xl'
          />

          <p className='mt-3 text-sm text-primary-foreground/85'>
            {pendingDebts.length}{' '}
            {pendingDebts.length === 1
              ? 'compromisso financeiro ainda em aberto.'
              : 'compromissos financeiros ainda em aberto.'}
          </p>
        </div>

        <div className='grid border-t border-primary-foreground/15 pt-5 lg:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 xl:grid-cols-3 xl:pl-8'>
          <div className='border-primary-foreground/15 pb-5 lg:border-r lg:pb-0 lg:pr-5'>
            <CircleX aria-hidden='true' className='size-7 text-warning' />
            <p className='mt-4 text-sm text-primary-foreground/80'>
              Dívidas pendentes
            </p>
            <strong className='mt-3 block text-3xl font-bold'>
              {pendingDebts.length}
            </strong>
          </div>

          <div className='border-t border-primary-foreground/15 py-5 lg:border-t-0 lg:py-0 lg:pl-5 xl:border-r xl:pr-5'>
            <CheckCircle2 aria-hidden='true' className='size-7 text-income' />
            <p className='mt-4 text-sm text-primary-foreground/80'>
              Dívidas pagas
            </p>
            <strong className='mt-3 block text-3xl font-bold'>
              {paidDebts.length}
            </strong>
          </div>

          <div className='border-t border-primary-foreground/15 pt-5 lg:col-span-2 lg:mt-5 xl:col-span-1 xl:mt-0 xl:border-t-0 xl:pt-0 xl:pl-5'>
            <BanknoteArrowDown
              aria-hidden='true'
              className='size-7 text-destructive'
            />
            <p className='mt-4 text-sm text-primary-foreground/80'>
              Valor pago
            </p>
            <MoneyDisplay
              value={paidTotal}
              className='mt-3 text-2xl font-bold text-primary-foreground'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
