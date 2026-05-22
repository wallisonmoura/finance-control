import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { FinanceEntryUi } from '../types/finance-ui.types';

type FinanceHistoryListProps = {
  entries: FinanceEntryUi[];
  onEditIncome?: (entry: FinanceEntryUi) => void;
  onDeleteIncome?: (entry: FinanceEntryUi) => void;
  onEditExpense?: (entry: FinanceEntryUi) => void;
  onDeleteExpense?: (entry: FinanceEntryUi) => void;
  deletingIncomeId?: string | null;
  deletingExpenseId?: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

function getEntryTypeLabel(type: FinanceEntryUi['type']) {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}

function getEntryTypeClassName(type: FinanceEntryUi['type']) {
  return type === 'INCOME'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-red-100 text-red-800';
}

function isDebtPaymentExpense(entry: FinanceEntryUi) {
  return entry.type === 'EXPENSE' && Boolean(entry.debtId);
}

export function FinanceHistoryList({
  entries,
  onEditIncome,
  onDeleteIncome,
  onEditExpense,
  onDeleteExpense,
  deletingIncomeId = null,
  deletingExpenseId = null,
}: FinanceHistoryListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title='Nenhum lançamento encontrado'
        description='Ajuste os filtros ou registre receitas e despesas para visualizar o histórico do período.'
      />
    );
  }

  return (
    <div className='space-y-3' aria-label='Histórico financeiro'>
      {entries.map((entry) => {
        const canManageIncome =
          entry.type === 'INCOME' && (onEditIncome || onDeleteIncome);
        const canManageExpense =
          entry.type === 'EXPENSE' &&
          !isDebtPaymentExpense(entry) &&
          (onEditExpense || onDeleteExpense);

        const isDeleting =
          deletingIncomeId === entry.id || deletingExpenseId === entry.id;

        return (
          <Card key={entry.id}>
            <div className='space-y-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getEntryTypeClassName(
                        entry.type,
                      )}`}
                    >
                      {getEntryTypeLabel(entry.type)}
                    </span>

                    <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'>
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  <h3 className='mt-2 break-words text-base font-semibold text-slate-900'>
                    {entry.description}
                  </h3>

                  {entry.notes && (
                    <p className='mt-1 break-words text-sm text-slate-500'>
                      {entry.notes}
                    </p>
                  )}

                  {entry.categoryId && (
                    <p className='mt-1 break-words text-xs text-slate-400'>
                      Categoria: {entry.categoryId}
                    </p>
                  )}

                  {isDebtPaymentExpense(entry) && (
                    <p className='mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'>
                      Gerada por pagamento de dívida.
                    </p>
                  )}
                </div>

                <MoneyDisplay
                  value={entry.amount}
                  className={
                    entry.type === 'INCOME'
                      ? 'text-lg font-semibold text-emerald-700 sm:text-right'
                      : 'text-lg font-semibold text-red-700 sm:text-right'
                  }
                />
              </div>

              {(canManageIncome || canManageExpense) && (
                <div className='grid gap-2 border-t border-slate-100 pt-3 sm:flex sm:flex-wrap sm:justify-end'>
                  {canManageIncome && onEditIncome && (
                    <Button
                      type='button'
                      onClick={() => onEditIncome(entry)}
                      disabled={isDeleting}
                      variant='secondary'
                      className='w-full sm:w-auto'
                    >
                      <Pencil aria-hidden='true' className='size-4' />
                      Editar
                    </Button>
                  )}

                  {canManageIncome && onDeleteIncome && (
                    <Button
                      type='button'
                      onClick={() => onDeleteIncome(entry)}
                      disabled={isDeleting}
                      variant='danger'
                      className='w-full sm:w-auto'
                    >
                      <Trash2 aria-hidden='true' className='size-4' />
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}

                  {canManageExpense && onEditExpense && (
                    <Button
                      type='button'
                      onClick={() => onEditExpense(entry)}
                      disabled={isDeleting}
                      variant='secondary'
                      className='w-full sm:w-auto'
                    >
                      <Pencil aria-hidden='true' className='size-4' />
                      Editar
                    </Button>
                  )}

                  {canManageExpense && onDeleteExpense && (
                    <Button
                      type='button'
                      onClick={() => onDeleteExpense(entry)}
                      disabled={isDeleting}
                      variant='danger'
                      className='w-full sm:w-auto'
                    >
                      <Trash2 aria-hidden='true' className='size-4' />
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
