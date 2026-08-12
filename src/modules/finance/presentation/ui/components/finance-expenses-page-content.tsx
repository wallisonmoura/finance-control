'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useExpenseCategories } from '../hooks/use-expense-categories';
import { useFinanceEntryMutationFlow } from '../hooks/use-finance-entry-mutation-flow';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteExpense } from '../services/finance-api.service';
import {
  ExpenseCategoryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';
import { ExpenseForm } from './expense-form';
import { FinanceBackLink } from './finance-back-link';
import { FinanceEntryList } from './finance-entry-list';

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

  const {
    isFormOpen,
    formContainerRef,
    editingEntry: editingExpense,
    entryToDelete: expenseToDelete,
    deletingEntryId: deletingExpenseId,
    actionError,
    openCreateForm,
    cancelForm,
    handleSaved,
    handleEdit,
    handleDelete,
    cancelDelete,
    confirmDelete,
  } = useFinanceEntryMutationFlow({
    deleteEntry: deleteExpense,
    refresh,
  });

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitle
          title='Despesas'
          description='Registre, acompanhe e gerencie suas despesas realizadas.'
        />

        {!isFormOpen && (
          <Button
            type='button'
            onClick={openCreateForm}
            variant='custom'
            className='bg-expense text-primary-foreground hover:bg-expense/90'
          >
            <Plus aria-hidden='true' className='size-4' />
            Nova despesa
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div ref={formContainerRef}>
          <ExpenseForm
            key={editingExpense?.id ?? 'create-expense'}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            categoriesError={categoriesError}
            editingExpense={editingExpense}
            onExpenseCreated={handleSaved}
            onExpenseUpdated={handleSaved}
            onCancel={cancelForm}
          />
        </div>
      )}

      <FinanceEntryList
        type='EXPENSE'
        entries={entries}
        isLoading={isLoading}
        error={error}
        actionError={actionError}
        deletingEntryId={deletingExpenseId}
        entryToDelete={expenseToDelete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConfirmDelete={confirmDelete}
        onCancelDelete={cancelDelete}
        onRetry={refresh}
      />
    </div>
  );
}
