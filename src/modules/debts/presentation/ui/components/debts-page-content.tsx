'use client';

import { useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useDebts } from '../hooks/use-debts';
import { deleteDebt } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';
import { DebtForm } from './debt-form';
import { DebtList } from './debt-list';
import { DebtOverviewSummary } from './debt-overview-summary';

export function DebtsPageContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtUi | null>(null);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { debts, isLoading, error, refresh } = useDebts();

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

  async function handleDeleteDebt(debt: DebtUi) {
    const confirmed = window.confirm(
      `Deseja excluir a divida "${debt.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingDebtId(debt.id);

    const response = await deleteDebt(debt.id);

    setDeletingDebtId(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingDebt?.id === debt.id) {
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
        <DebtOverviewSummary debts={debts} onCreateDebt={handleOpenCreateForm} />
      )}

      {isFormOpen && (
        <div className='flex justify-end'>
          <Button type='button' onClick={handleCancelForm}>
            Cancelar
          </Button>
        </div>
      )}

      {isFormOpen && (
        <DebtForm
          key={editingDebt?.id ?? 'create-debt'}
          editingDebt={editingDebt}
          onDebtCreated={handleDebtSaved}
          onDebtUpdated={handleDebtSaved}
          onCancel={handleCancelForm}
        />
      )}

      {isLoading && <p className='text-sm text-slate-500'>Carregando dividas...</p>}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {actionError && <p className='text-sm text-red-600'>{actionError}</p>}

      {!isLoading && !error && (
        <DebtList
          debts={debts}
          onEditDebt={handleEditDebt}
          onDeleteDebt={handleDeleteDebt}
          deletingDebtId={deletingDebtId}
        />
      )}
    </div>
  );
}
