'use client';

import { useEffect, useState } from 'react';

import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { usePendingDebts } from '../hooks/use-pending-debts';
import { DebtUi } from '../types/debt-ui.types';
import { DebtList } from './debt-list';
import { DebtPaymentForm } from './debt-payment-form';

type PendingDebtsPageContentProps = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function PendingDebtsPageContent({
  initialDebts = [],
  initialError = null,
}: PendingDebtsPageContentProps) {
  const [payingDebt, setPayingDebt] = useState<DebtUi | null>(null);

  const { debts, isLoading, error, refresh } = usePendingDebts({
    initialDebts,
    initialError,
  });
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refresh: refreshCategories,
  } = useExpenseCategories();

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  function handleCancelPayment() {
    setPayingDebt(null);
  }

  async function handleDebtPaid() {
    setPayingDebt(null);

    await refresh();
  }

  return (
    <div className='space-y-6'>
      <BackLink href='/debts'>Voltar para dívidas</BackLink>

      <PageTitle
        title='Dívidas pendentes'
        description='Pague dívidas pendentes gerando a despesa financeira e atualizando a Carteira.'
      />

      {isLoading && (
        <p className='text-sm text-muted-foreground'>Carregando dívidas...</p>
      )}

      {error && <p className='text-sm text-destructive'>{error}</p>}

      {!isLoading && !error && (
        <DebtList
          debts={debts}
          onPayDebt={(debt) => setPayingDebt(debt)}
          expandedDebtId={payingDebt?.id ?? null}
          renderExpandedContent={(debt) => (
            <DebtPaymentForm
              key={debt.id}
              debt={debt}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              categoriesError={categoriesError}
              onDebtPaid={handleDebtPaid}
              onCancel={handleCancelPayment}
              embedded
            />
          )}
        />
      )}
    </div>
  );
}
