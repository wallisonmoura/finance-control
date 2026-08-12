import { CalendarDays, CheckCircle2, WalletCards } from 'lucide-react';

import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { formatDateOrFallback } from '@/shared/presentation/ui/lib/format-date';

import { DebtUi } from '../types/debts-ui.types';
import { DebtList } from './debt-list';

type PaidDebtsPageContentProps = {
  debts: DebtUi[];
  error?: string | null;
};

function sumDebts(debts: DebtUi[]) {
  return debts.reduce((total, debt) => total + debt.amount, 0);
}

function getLastPaymentDate(debts: DebtUi[]) {
  return (
    debts
      .map((debt) => debt.paidAt)
      .filter((date): date is string => Boolean(date))
      .sort((first, second) => second.localeCompare(first))[0] ?? null
  );
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

      {error && <FormErrorMessage message={error} />}

      {!error && (
        <>
          <Card className='border-income/20 bg-income-muted/20 p-0'>
            <div className='grid divide-y divide-income/20 lg:grid-cols-3 lg:divide-x lg:divide-y-0'>
              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-income-muted text-income ring-1 ring-income/20'>
                  <CheckCircle2 aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Total pago
                  </p>
                  <MoneyDisplay
                    value={totalPaid}
                    className='mt-1 text-xl font-bold text-income'
                  />
                </div>
              </div>

              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border'>
                  <CalendarDays aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Qtd. de dívidas pagas
                  </p>
                  <strong className='mt-1 block text-xl font-bold text-foreground'>
                    {paidDebts.length}
                  </strong>
                </div>
              </div>

              <div className='flex items-center gap-4 p-5'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border'>
                  <WalletCards aria-hidden='true' className='size-6' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Último pagamento
                  </p>
                  <strong className='mt-1 block text-xl font-bold text-foreground'>
                    {formatDateOrFallback(lastPaymentDate)}
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
