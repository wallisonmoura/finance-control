'use client';

import { useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useExpenseCategories } from '../hooks/use-expense-categories';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteExpense } from '../services/finance-api.service';
import { FinanceEntryUi } from '../types/finance-ui.types';
import { ExpenseForm } from './expense-form';
import { FinanceBackLink } from './finance-back-link';
import { FinanceHistoryList } from './finance-history-list';

export function FinanceExpensesPageContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinanceEntryUi | null>(
    null,
  );
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { entries, isLoading, error, refresh } = useFinanceHistory({
    type: 'EXPENSE',
  });

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useExpenseCategories();

  function handleOpenCreateForm() {
    setActionError(null);
    setEditingExpense(null);
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    setActionError(null);
    setEditingExpense(null);
    setIsFormOpen(false);
  }

  async function handleExpenseSaved() {
    setActionError(null);
    setEditingExpense(null);
    setIsFormOpen(false);

    await refresh();
  }

  function handleEditExpense(entry: FinanceEntryUi) {
    setActionError(null);
    setEditingExpense(entry);
    setIsFormOpen(true);
  }

  async function handleDeleteExpense(entry: FinanceEntryUi) {
    const confirmed = window.confirm(
      `Deseja excluir a despesa "${entry.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingExpenseId(entry.id);

    const response = await deleteExpense(entry.id);

    setDeletingExpenseId(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingExpense?.id === entry.id) {
      setEditingExpense(null);
      setIsFormOpen(false);
    }

    await refresh();
  }

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <PageTitle
        title='Despesas'
        description='Registre, acompanhe e gerencie suas despesas realizadas.'
      />

      <div className='flex justify-end'>
        {!isFormOpen ? (
          <Button type='button' onClick={handleOpenCreateForm}>
            Nova despesa
          </Button>
        ) : (
          <Button type='button' onClick={handleCancelForm}>
            Cancelar
          </Button>
        )}
      </div>

      {isFormOpen && (
        <ExpenseForm
          key={editingExpense?.id ?? 'create-expense'}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          categoriesError={categoriesError}
          editingExpense={editingExpense}
          onExpenseCreated={handleExpenseSaved}
          onExpenseUpdated={handleExpenseSaved}
          onCancel={handleCancelForm}
        />
      )}

      {isLoading && (
        <p className='text-sm text-slate-500'>Carregando despesas...</p>
      )}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {actionError && <p className='text-sm text-red-600'>{actionError}</p>}

      {!isLoading && !error && (
        <FinanceHistoryList
          entries={entries}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          deletingExpenseId={deletingExpenseId}
        />
      )}
    </div>
  );
}
