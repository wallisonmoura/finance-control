'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useFinanceEntryMutationFlow } from '../hooks/use-finance-entry-mutation-flow';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteIncome } from '../services/finance-api.service';
import { FinanceHistoryFiltersUi, FinanceHistoryUi } from '../types/finance-ui.types';
import { FinanceBackLink } from './finance-back-link';
import { FinanceEntryList } from './finance-entry-list';
import { IncomeForm } from './income-form';

type FinanceIncomesPageContentProps = {
  initialHistory?: FinanceHistoryUi | null;
  initialError?: string | null;
  initialFilters?: FinanceHistoryFiltersUi;
};

export function FinanceIncomesPageContent({
  initialHistory = null,
  initialError = null,
  initialFilters,
}: FinanceIncomesPageContentProps) {
  const { entries, isLoading, error, refresh } = useFinanceHistory({
    ...initialFilters,
    type: 'INCOME',
    initialData: initialHistory,
    initialError,
  });

  const {
    isFormOpen,
    formContainerRef,
    editingEntry: editingIncome,
    entryToDelete: incomeToDelete,
    deletingEntryId: deletingIncomeId,
    actionError,
    openCreateForm,
    cancelForm,
    handleSaved,
    handleEdit,
    handleDelete,
    cancelDelete,
    confirmDelete,
  } = useFinanceEntryMutationFlow({
    deleteEntry: deleteIncome,
    refresh,
  });

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitle
          title='Receitas'
          description='Registre, acompanhe e gerencie suas entradas financeiras.'
        />

        {!isFormOpen && (
          <Button
            type='button'
            onClick={openCreateForm}
            variant='custom'
            className='bg-income text-primary-foreground hover:bg-income/90'
          >
            <Plus aria-hidden='true' className='size-4' />
            Nova receita
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div ref={formContainerRef}>
          <IncomeForm
            key={editingIncome?.id ?? 'create-income'}
            editingIncome={editingIncome}
            onIncomeCreated={handleSaved}
            onIncomeUpdated={handleSaved}
            onCancel={cancelForm}
          />
        </div>
      )}

      <FinanceEntryList
        type='INCOME'
        entries={entries}
        isLoading={isLoading}
        error={error}
        actionError={actionError}
        deletingEntryId={deletingIncomeId}
        entryToDelete={incomeToDelete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConfirmDelete={confirmDelete}
        onCancelDelete={cancelDelete}
        onRetry={refresh}
      />
    </div>
  );
}
