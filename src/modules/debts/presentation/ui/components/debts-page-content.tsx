'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useDebts } from '../hooks/use-debts';
import { deleteDebt } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';
import {
  filterDebtsByMonth,
  getDebtsMonthFromUrlSearchParams,
} from '../utils/debt-filters';
import { DebtActionsBar } from './debt-actions-bar';
import { DebtForm } from './debt-form';
import { DebtList } from './debt-list';
import { DebtOverviewSummary } from './debt-overview-summary';
import { DebtsMonthFilter } from './debts-month-filter';
import { DebtsMonthSummary } from './debts-month-summary';

type DebtsPageContentProps = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function DebtsPageContent({
  initialDebts = [],
  initialError = null,
}: DebtsPageContentProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [editingDebt, setEditingDebt] = useState<DebtUi | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<DebtUi | null>(null);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { debts, isLoading, error, refresh } = useDebts({
    initialDebts,
    initialError,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const month = useMemo(
    () => getDebtsMonthFromUrlSearchParams(searchParams),
    [searchParams],
  );

  const filteredDebts = useMemo(
    () => filterDebtsByMonth(debts, month),
    [debts, month],
  );

  function handleMonthChange(nextMonth: string) {
    router.push(`/debts?month=${nextMonth}`);
  }

  useEffect(() => {
    if (!editingDebt || !isFormOpen) {
      return;
    }

    formContainerRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
    formContainerRef.current
      ?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea',
      )
      ?.focus({ preventScroll: true });
  }, [editingDebt, isFormOpen]);

  function handleOpenCreateForm() {
    setActionError(null);
    setEditingDebt(null);
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    setActionError(null);
    setEditingDebt(null);
    setIsFormOpen(false);
  }

  async function handleDebtSaved() {
    setActionError(null);
    setEditingDebt(null);
    setIsFormOpen(false);

    await refresh();
  }

  function handleEditDebt(debt: DebtUi) {
    setActionError(null);
    setEditingDebt(debt);
    setIsFormOpen(true);
  }

  function handleDeleteDebt(debt: DebtUi) {
    setActionError(null);
    setDebtToDelete(debt);
  }

  async function handleConfirmDeleteDebt() {
    if (!debtToDelete) {
      return;
    }

    setActionError(null);
    setDeletingDebtId(debtToDelete.id);

    const response = await deleteDebt(debtToDelete.id);

    setDeletingDebtId(null);
    setDebtToDelete(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingDebt?.id === debtToDelete.id) {
      setEditingDebt(null);
      setIsFormOpen(false);
    }

    await refresh();
  }

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Dívidas'
        description='Registre, acompanhe e gerencie compromissos financeiros pendentes ou pagos.'
      />

      {!isLoading && !error && !isFormOpen && (
        <DebtOverviewSummary debts={debts} />
      )}

      {isFormOpen && (
        <div ref={formContainerRef}>
          <DebtForm
            key={editingDebt?.id ?? 'create-debt'}
            editingDebt={editingDebt}
            onDebtCreated={handleDebtSaved}
            onDebtUpdated={handleDebtSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {isLoading && (
        <p className='text-sm text-muted-foreground'>Carregando dívidas...</p>
      )}

      {error && <FormErrorMessage message={error} />}

      {actionError && <FormErrorMessage message={actionError} />}

      {!isLoading && !error && (
        <div className='space-y-4 border-t border-border pt-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <DebtsMonthFilter month={month} onMonthChange={handleMonthChange} />

            {!isFormOpen && (
              <DebtActionsBar onCreateDebt={handleOpenCreateForm} />
            )}
          </div>

          <DebtsMonthSummary debts={filteredDebts} />

          <DebtList
            debts={filteredDebts}
            onEditDebt={handleEditDebt}
            onDeleteDebt={handleDeleteDebt}
            deletingDebtId={deletingDebtId}
          />
        </div>
      )}

      <ConfirmDialog
        open={debtToDelete !== null}
        title='Excluir dívida'
        description={`Deseja excluir a dívida "${debtToDelete?.description ?? ''}"?`}
        confirmLabel='Excluir'
        confirmingLabel='Excluindo...'
        isConfirming={deletingDebtId === debtToDelete?.id}
        onOpenChange={(open) => {
          if (!open) {
            setDebtToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteDebt}
      />
    </div>
  );
}
