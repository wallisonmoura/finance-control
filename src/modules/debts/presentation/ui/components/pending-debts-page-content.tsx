'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { SCREEN_HELP } from '@/shared/presentation/ui/help/screen-help';

import { usePendingDebts } from '../hooks/use-pending-debts';
import { DebtPaymentCategoryUi, DebtUi } from '../types/debts-ui.types';
import { DebtsBackLink } from './debts-back-link';
import { DebtList } from './debt-list';
import { DebtPaymentForm } from './debt-payment-form';

type PendingDebtsPageContentProps = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
  // Loaded by the page, so debts does not depend on finance's hooks.
  categories?: DebtPaymentCategoryUi[];
  categoriesError?: string | null;
};

export function PendingDebtsPageContent({
  initialDebts = [],
  initialError = null,
  categories = [],
  categoriesError = null,
}: PendingDebtsPageContentProps) {
  const router = useRouter();

  const [payingDebt, setPayingDebt] = useState<DebtUi | null>(null);

  const { debts, isLoading, error, refresh } = usePendingDebts({
    initialDebts,
    initialError,
  });
  function handleCancelPayment() {
    setPayingDebt(null);
  }

  async function handleDebtPaid() {
    setPayingDebt(null);

    await refresh();
    router.refresh();
  }

  // The list lives in useState(initialDebts): router.refresh() alone does not
  // bring the debt back, so refresh the hook too.
  async function handlePaymentUndone() {
    await refresh();
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      <DebtsBackLink />

      <PageTitle
        title='Dívidas pendentes'
        help={SCREEN_HELP.pendingDebts}
        description='Pague dívidas pendentes gerando a despesa financeira e atualizando a Carteira.'
      />

      {isLoading && (
        <p className='text-sm text-muted-foreground'>Carregando dívidas...</p>
      )}

      {error && <LoadErrorState message={error} onRetry={refresh} />}

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
              categoriesError={categoriesError}
              onDebtPaid={handleDebtPaid}
              onPaymentUndone={handlePaymentUndone}
              onCancel={handleCancelPayment}
              embedded
            />
          )}
        />
      )}
    </div>
  );
}
