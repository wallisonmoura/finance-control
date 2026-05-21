'use client';

import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useDebts } from '../hooks/use-debts';
import { DebtList } from './debt-list';

export function PaidDebtsPageContent() {
  const { debts, isLoading, error } = useDebts();
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  return (
    <div className='space-y-6'>
      <BackLink href='/debts'>Voltar para dívidas</BackLink>

      <PageTitle
        title='Dívidas pagas'
        description='Consulte compromissos financeiros que já foram quitados.'
      />

      {isLoading && (
        <p className='text-sm text-slate-500'>Carregando dívidas...</p>
      )}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!isLoading && !error && <DebtList debts={paidDebts} />}
    </div>
  );
}
