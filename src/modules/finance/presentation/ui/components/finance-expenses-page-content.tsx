'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useExpenseCategories } from '../hooks/use-expense-categories';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteExpense } from '../services/finance-api.service';
import {
  ExpenseCategoryUi,
  FinanceEntryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';
import { ExpenseForm } from './expense-form';
import { FinanceBackLink } from './finance-back-link';
import { FinanceHistoryList } from './finance-history-list';

type FinanceExpensesPageContentProps = {
  initialHistory?: FinanceHistoryUi | null;
  initialHistoryError?: string | null;
  initialFilters?: FinanceHistoryFiltersUi;
  initialCategories?: ExpenseCategoryUi[];
  initialCategoriesError?: string | null;
};

export function FinanceExpensesPageContent({
  initialHistory = null,
  initialHistoryError = null,
  initialFilters,
  initialCategories = [],
  initialCategoriesError = null,
}: FinanceExpensesPageContentProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinanceEntryUi | null>(
    null,
  );
  const [expenseToDelete, setExpenseToDelete] =
    useState<FinanceEntryUi | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { entries, isLoading, error, refresh } = useFinanceHistory({
    ...initialFilters,
    type: 'EXPENSE',
    initialData: initialHistory,
    initialError: initialHistoryError,
  });

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useExpenseCategories({
    initialCategories,
    initialError: initialCategoriesError,
  });

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

  function handleDeleteExpense(entry: FinanceEntryUi) {
    setActionError(null);
    setExpenseToDelete(entry);
  }

  async function handleConfirmDeleteExpense() {
    if (!expenseToDelete) {
      return;
    }

    setActionError(null);
    setDeletingExpenseId(expenseToDelete.id);

    const response = await deleteExpense(expenseToDelete.id);

    setDeletingExpenseId(null);
    setExpenseToDelete(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingExpense?.id === expenseToDelete.id) {
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

      {!isFormOpen && (
        <div className='flex justify-end'>
          <Button type='button' onClick={handleOpenCreateForm}>
            <Plus aria-hidden='true' className='size-4' />
            Nova despesa
          </Button>
        </div>
      )}

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

      <ConfirmDialog
        open={expenseToDelete !== null}
        title='Excluir despesa'
        description={`Deseja excluir a despesa "${expenseToDelete?.description ?? ''}"?`}
        confirmLabel='Excluir'
        isConfirming={deletingExpenseId === expenseToDelete?.id}
        onOpenChange={(open) => {
          if (!open) {
            setExpenseToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteExpense}
      />
    </div>
  );
}
