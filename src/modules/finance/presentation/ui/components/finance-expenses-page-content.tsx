'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2, WalletCards } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
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

type FinanceExpensesPageContentProps = {
  initialHistory?: FinanceHistoryUi | null;
  initialHistoryError?: string | null;
  initialFilters?: FinanceHistoryFiltersUi;
  initialCategories?: ExpenseCategoryUi[];
  initialCategoriesError?: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

function isDebtPaymentExpense(entry: FinanceEntryUi) {
  return entry.type === 'EXPENSE' && Boolean(entry.debtId);
}

export function FinanceExpensesPageContent({
  initialHistory = null,
  initialHistoryError = null,
  initialFilters,
  initialCategories = [],
  initialCategoriesError = null,
}: FinanceExpensesPageContentProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!editingExpense || !isFormOpen) {
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
  }, [editingExpense, isFormOpen]);

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

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitle
          title='Despesas'
          description='Registre, acompanhe e gerencie suas despesas realizadas.'
        />

        {!isFormOpen && (
          <Button
            type='button'
            onClick={handleOpenCreateForm}
            className='!bg-red-600 !text-white hover:!bg-red-700'
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
            onExpenseCreated={handleExpenseSaved}
            onExpenseUpdated={handleExpenseSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {isLoading && (
        <p className='text-sm text-slate-500'>Carregando despesas...</p>
      )}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {actionError && <p className='text-sm text-red-600'>{actionError}</p>}

      {!isLoading && !error && (
        <Card className='overflow-hidden p-0'>
          <div className='flex items-center gap-3 border-b border-slate-200 px-5 py-4'>
            <h2 className='text-base font-semibold text-slate-950'>
              Despesas cadastradas
            </h2>
            <span className='rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700'>
              {entries.length}
            </span>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title='Nenhuma despesa encontrada'
              description='Registre uma despesa para visualizar saídas financeiras neste período.'
            />
          ) : (
            <div className='space-y-3 p-4 sm:p-5'>
              {entries.map((entry) => {
                const isDeleting = deletingExpenseId === entry.id;
                const canManageExpense = !isDebtPaymentExpense(entry);

                return (
                  <div
                    key={entry.id}
                    className='grid gap-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-red-100 hover:shadow-md sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'
                  >
                    <div className='flex min-w-0 gap-4'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100'>
                        <WalletCards aria-hidden='true' className='size-6' />
                      </div>

                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'>
                            Despesa
                          </span>
                          <span className='h-4 w-px bg-slate-200' />
                          <span className='flex items-center gap-1 text-sm font-semibold text-slate-500'>
                            <CalendarDays
                              aria-hidden='true'
                              className='size-4'
                            />
                            {formatDate(entry.date)}
                          </span>
                        </div>

                        <h3 className='mt-2 break-words text-base font-semibold text-slate-950'>
                          {entry.description}
                        </h3>

                        {entry.notes ? (
                          <p className='mt-1 break-words text-sm leading-6 text-slate-500'>
                            {entry.notes}
                          </p>
                        ) : null}

                        {isDebtPaymentExpense(entry) ? (
                          <p className='mt-2 text-sm font-medium text-slate-500'>
                            Gerada por pagamento de dívida.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className='grid gap-3 sm:justify-items-end'>
                      <MoneyDisplay
                        value={entry.amount}
                        className='text-left text-xl font-bold !text-red-700 sm:text-right'
                      />

                      {canManageExpense ? (
                        <div className='grid gap-2 sm:flex sm:items-center sm:justify-end'>
                          <Button
                            type='button'
                            onClick={() => handleEditExpense(entry)}
                            disabled={isDeleting}
                            variant='secondary'
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
                          >
                            <Pencil aria-hidden='true' className='size-4' />
                            Editar
                          </Button>

                          <Button
                            type='button'
                            onClick={() => handleDeleteExpense(entry)}
                            disabled={isDeleting}
                            variant='danger'
                            className='h-10 w-full min-w-28 rounded-lg bg-white px-4 text-sm shadow-none sm:w-auto'
                          >
                            <Trash2 aria-hidden='true' className='size-4' />
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              <p className='pt-1 text-center text-sm text-slate-500'>
                {entries.length}{' '}
                {entries.length === 1
                  ? 'despesa encontrada'
                  : 'despesas encontradas'}
              </p>
            </div>
          )}
        </Card>
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
