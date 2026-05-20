'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { Button } from '@/shared/presentation/ui/components/button';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { usePendingDebts } from '../hooks/use-pending-debts';
import { DebtUi } from '../types/debt-ui.types';
import { DebtList } from './debt-list';
import { DebtPaymentForm } from './debt-payment-form';

export function PendingDebtsPageContent() {
  const [payingDebt, setPayingDebt] = useState<DebtUi | null>(null);

  const { debts, isLoading, error, refresh } = usePendingDebts();
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useExpenseCategories();

  function handleCancelPayment() {
    setPayingDebt(null);
  }

  async function handleDebtPaid() {
    setPayingDebt(null);

    await refresh();
  }

  return (
    <div className='space-y-6'>
      <Link
        href='/debts'
        className='inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950'
      >
        Voltar para dívidas
      </Link>

      <PageTitle
        title='Dívidas pendentes'
        description='Pague dívidas pendentes gerando a despesa financeira e atualizando a wallet.'
      />

      {payingDebt ? (
        <div className='flex justify-end'>
          <Button type='button' onClick={handleCancelPayment}>
            Cancelar
          </Button>
        </div>
      ) : null}

      {payingDebt && (
        <DebtPaymentForm
          key={payingDebt.id}
          debt={payingDebt}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          categoriesError={categoriesError}
          onDebtPaid={handleDebtPaid}
          onCancel={handleCancelPayment}
        />
      )}

      {isLoading && <p className='text-sm text-slate-500'>Carregando dividas...</p>}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!isLoading && !error && (
        <DebtList debts={debts} onPayDebt={(debt) => setPayingDebt(debt)} />
      )}
    </div>
  );
}
