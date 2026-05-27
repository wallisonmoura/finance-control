import { CalendarDays, CheckCircle2, WalletCards } from 'lucide-react';

import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { DebtUi } from '../types/debt-ui.types';
import { DebtList } from './debt-list';

type PaidDebtsPageContentProps = {
  debts: DebtUi[];
  error?: string | null;
};

function sumDebts(debts: DebtUi[]) {
  return debts.reduce((total, debt) => total + debt.amount, 0);
}

function formatDate(date: string | null) {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

function getLastPaymentDate(debts: DebtUi[]) {
  return debts
    .map((debt) => debt.paidAt)
    .filter((date): date is string => Boolean(date))
    .sort((first, second) => second.localeCompare(first))[0] ?? null;
}

export function PaidDebtsPageContent({
  debts,
  error = null,
}: PaidDebtsPageContentProps) {
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');
  const totalPaid = sumDebts(paidDebts);
  const lastPaymentDate = getLastPaymentDate(paidDebts);

  return (
    <div className='space-y-6'>
      <BackLink href='/debts'>Voltar para dívidas</BackLink>

      <PageTitle
        title='Dívidas pagas'
        description='Consulte compromissos financeiros que já foram quitados.'
      />

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!error && (
        <>
          <Card className='border-emerald-100 bg-emerald-50/20 p-0'>
            <div className='grid divide-y divide-emerald-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0'>
              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'>
                  <CheckCircle2 aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-slate-500'>
                    Total pago
                  </p>
                  <MoneyDisplay
                    value={totalPaid}
                    className='mt-1 text-xl font-bold !text-emerald-700'
                  />
                </div>
              </div>

              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200'>
                  <CalendarDays aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-slate-500'>
                    Qtd. de dívidas pagas
                  </p>
                  <strong className='mt-1 block text-xl font-bold text-slate-950'>
                    {paidDebts.length}
                  </strong>
                </div>
              </div>

              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200'>
                  <WalletCards aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-slate-500'>
                    Último pagamento
                  </p>
                  <strong className='mt-1 block text-xl font-bold text-slate-950'>
                    {formatDate(lastPaymentDate)}
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          <DebtList debts={paidDebts} title={null} />
        </>
      )}
    </div>
  );
}
