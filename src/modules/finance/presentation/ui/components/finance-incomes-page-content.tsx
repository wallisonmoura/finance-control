'use client';

import { useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteIncome } from '../services/finance-api.service';
import { FinanceEntryUi } from '../types/finance-ui.types';
import { FinanceBackLink } from './finance-back-link';
import { FinanceHistoryList } from './finance-history-list';
import { IncomeForm } from './income-form';

export function FinanceIncomesPageContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<FinanceEntryUi | null>(
    null,
  );
  const [incomeToDelete, setIncomeToDelete] = useState<FinanceEntryUi | null>(
    null,
  );
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { entries, isLoading, error, refresh } = useFinanceHistory({
    type: 'INCOME',
  });

  function handleOpenCreateForm() {
    setActionError(null);
    setEditingIncome(null);
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    setActionError(null);
    setEditingIncome(null);
    setIsFormOpen(false);
  }

  async function handleIncomeSaved() {
    setActionError(null);
    setEditingIncome(null);
    setIsFormOpen(false);

    await refresh();
  }

  function handleEditIncome(entry: FinanceEntryUi) {
    setActionError(null);
    setEditingIncome(entry);
    setIsFormOpen(true);
  }

  function handleDeleteIncome(entry: FinanceEntryUi) {
    setActionError(null);
    setIncomeToDelete(entry);
  }

  async function handleConfirmDeleteIncome() {
    if (!incomeToDelete) {
      return;
    }

    setActionError(null);
    setDeletingIncomeId(incomeToDelete.id);

    const response = await deleteIncome(incomeToDelete.id);

    setDeletingIncomeId(null);
    setIncomeToDelete(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingIncome?.id === incomeToDelete.id) {
      setEditingIncome(null);
      setIsFormOpen(false);
    }

    await refresh();
  }

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <PageTitle
        title='Receitas'
        description='Registre, acompanhe e gerencie suas receitas realizadas.'
      />

      <div className='flex justify-end'>
        {!isFormOpen ? (
          <Button type='button' onClick={handleOpenCreateForm}>
            Nova receita
          </Button>
        ) : (
          <Button type='button' onClick={handleCancelForm}>
            Cancelar
          </Button>
        )}
      </div>

      {isFormOpen && (
        <IncomeForm
          key={editingIncome?.id ?? 'create-income'}
          editingIncome={editingIncome}
          onIncomeCreated={handleIncomeSaved}
          onIncomeUpdated={handleIncomeSaved}
          onCancel={handleCancelForm}
        />
      )}

      {isLoading && (
        <p className='text-sm text-slate-500'>Carregando receitas...</p>
      )}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {actionError && <p className='text-sm text-red-600'>{actionError}</p>}

      {!isLoading && !error && (
        <FinanceHistoryList
          entries={entries}
          onEditIncome={handleEditIncome}
          onDeleteIncome={handleDeleteIncome}
          deletingIncomeId={deletingIncomeId}
        />
      )}

      <ConfirmDialog
        open={incomeToDelete !== null}
        title='Excluir receita'
        description={`Deseja excluir a receita "${incomeToDelete?.description ?? ''}"?`}
        confirmLabel='Excluir'
        isConfirming={deletingIncomeId === incomeToDelete?.id}
        onOpenChange={(open) => {
          if (!open) {
            setIncomeToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteIncome}
      />
    </div>
  );
}
