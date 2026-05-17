'use client';

import { useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
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

  async function handleDeleteIncome(entry: FinanceEntryUi) {
    const confirmed = window.confirm(
      `Deseja excluir a receita "${entry.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingIncomeId(entry.id);

    const response = await deleteIncome(entry.id);

    setDeletingIncomeId(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingIncome?.id === entry.id) {
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
    </div>
  );
}
