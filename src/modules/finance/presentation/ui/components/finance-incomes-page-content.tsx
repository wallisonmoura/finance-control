'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  BanknoteArrowUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useFinanceHistory } from '../hooks/use-finance-history';
import { deleteIncome } from '../services/finance-api.service';
import {
  FinanceEntryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';
import { FinanceBackLink } from './finance-back-link';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [editingIncome, setEditingIncome] = useState<FinanceEntryUi | null>(
    null,
  );
  const [incomeToDelete, setIncomeToDelete] = useState<FinanceEntryUi | null>(
    null,
  );
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { entries, isLoading, error, refresh } = useFinanceHistory({
    ...initialFilters,
    type: 'INCOME',
    initialData: initialHistory,
    initialError,
  });

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(new Date(date));
  }

  useEffect(() => {
    if (!editingIncome || !isFormOpen) {
      return;
    }

    formContainerRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
    formContainerRef.current
      ?.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input, select, textarea')
      ?.focus({ preventScroll: true });
  }, [editingIncome, isFormOpen]);

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

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitle
          title='Receitas'
          description='Registre, acompanhe e gerencie suas entradas financeiras.'
        />

        {!isFormOpen && (
          <Button
            type='button'
            onClick={handleOpenCreateForm}
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
            onIncomeCreated={handleIncomeSaved}
            onIncomeUpdated={handleIncomeSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {isLoading && (
        <p className='text-sm text-muted-foreground'>Carregando receitas...</p>
      )}

      {error && <p className='text-sm text-destructive'>{error}</p>}

      {actionError && <p className='text-sm text-destructive'>{actionError}</p>}

      {!isLoading && !error && (
        <Card className='overflow-hidden p-0'>
          <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
            <h2 className='text-base font-semibold text-foreground'>
              Receitas cadastradas
            </h2>
            <span className='rounded-full bg-income-muted px-3 py-1 text-sm font-semibold text-income'>
              {entries.length}
            </span>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title='Nenhuma receita encontrada'
              description='Registre uma receita para visualizar entradas financeiras neste período.'
            />
          ) : (
            <div className='space-y-3 p-4 sm:p-5'>
              {entries.map((entry) => {
                const isDeleting = deletingIncomeId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className='grid gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-income/20 hover:shadow-md sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'
                  >
                    <div className='flex min-w-0 gap-4'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-income-muted text-income ring-1 ring-income/20'>
                        <BanknoteArrowUp
                          aria-hidden='true'
                          className='size-6'
                        />
                      </div>

                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='rounded-full bg-income-muted px-3 py-1 text-xs font-semibold text-income'>
                            Receita
                          </span>
                          <span className='h-4 w-px bg-border' />
                          <span className='flex items-center gap-1 text-sm font-semibold text-muted-foreground'>
                            <CalendarDays
                              aria-hidden='true'
                              className='size-4'
                            />
                            {formatDate(entry.date)}
                          </span>
                        </div>

                        <h3 className='mt-2 wrap-break-word text-base font-semibold text-foreground'>
                          {entry.description}
                        </h3>

                        {entry.notes ? (
                          <p className='mt-1 wrap-break-word text-sm leading-6 text-muted-foreground'>
                            {entry.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className='grid gap-3 sm:justify-items-end'>
                      <MoneyDisplay
                        value={entry.amount}
                        className='text-left text-xl font-bold text-income sm:text-right'
                      />

                      <div className='grid gap-2 sm:flex sm:items-center sm:justify-end'>
                        <Button
                          type='button'
                          onClick={() => handleEditIncome(entry)}
                          disabled={isDeleting}
                          variant='secondary'
                          className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
                        >
                          <Pencil aria-hidden='true' className='size-4' />
                          Editar
                        </Button>

                        <Button
                          type='button'
                          onClick={() => handleDeleteIncome(entry)}
                          disabled={isDeleting}
                          variant='danger'
                          className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
                        >
                          <Trash2 aria-hidden='true' className='size-4' />
                          {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <p className='pt-1 text-center text-sm text-muted-foreground'>
                {entries.length}{' '}
                {entries.length === 1
                  ? 'receita encontrada'
                  : 'receitas encontradas'}
              </p>
            </div>
          )}
        </Card>
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
