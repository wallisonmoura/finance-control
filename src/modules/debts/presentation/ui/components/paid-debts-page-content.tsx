'use client';

import Link from 'next/link';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useDebts } from '../hooks/use-debts';
import { DebtList } from './debt-list';

export function PaidDebtsPageContent() {
  const { debts, isLoading, error } = useDebts();
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  return (
    <div className='space-y-6'>
      <Link
        href='/debts'
        className='inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950'
      >
        Voltar para dívidas
      </Link>

      <PageTitle
        title='Dívidas pagas'
        description='Consulte compromissos financeiros que ja foram quitados.'
      />

      {isLoading && <p className='text-sm text-slate-500'>Carregando dividas...</p>}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!isLoading && !error && <DebtList debts={paidDebts} />}
    </div>
  );
}
