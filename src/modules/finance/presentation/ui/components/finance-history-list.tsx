import { ArrowDown, ArrowUp, CalendarDays, Pencil, Trash2 } from 'lucide-react';

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

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
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

function groupEntriesByDate(entries: FinanceEntryUi[]) {
  const groups = new Map<string, FinanceEntryUi[]>();

  for (const entry of entries) {
    const dateKey = entry.date.slice(0, 10);
    const currentEntries = groups.get(dateKey) ?? [];

    currentEntries.push(entry);
    groups.set(dateKey, currentEntries);
  }

  return [...groups.entries()];
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
    <Card className='overflow-hidden p-0' aria-label='Histórico financeiro'>
      {groupEntriesByDate(entries).map(([dateKey, dateEntries]) => (
        <section key={dateKey}>
          <div className='flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-sm font-semibold text-slate-700'>
            <CalendarDays aria-hidden='true' className='size-4' />
            {formatLongDate(dateEntries[0].date)}
          </div>

          <div className='divide-y divide-slate-100'>
            {dateEntries.map((entry) => {
              const canManageIncome =
                entry.type === 'INCOME' && (onEditIncome || onDeleteIncome);
              const canManageExpense =
                entry.type === 'EXPENSE' &&
                !isDebtPaymentExpense(entry) &&
                (onEditExpense || onDeleteExpense);

              const isDeleting =
                deletingIncomeId === entry.id || deletingExpenseId === entry.id;
              const isIncome = entry.type === 'INCOME';
              const EntryIcon = isIncome ? ArrowUp : ArrowDown;

              return (
                <div
                  key={entry.id}
                  className='grid gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'
                >
                  <div className='flex min-w-0 gap-4'>
                    <div
                      className={[
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1',
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                          : 'bg-red-50 text-red-600 ring-red-100',
                      ].join(' ')}
                    >
                      <EntryIcon aria-hidden='true' className='size-6' />
                    </div>

                    <div className='min-w-0'>
                      <h3 className='break-words text-base font-semibold text-slate-950'>
                        {entry.description}
                      </h3>

                      <div className='mt-1 flex flex-wrap items-center gap-2'>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getEntryTypeClassName(
                            entry.type,
                          )}`}
                        >
                          {getEntryTypeLabel(entry.type)}
                        </span>

                        {entry.categoryId && (
                          <>
                            <span className='h-4 w-px bg-slate-200' />
                            <span className='text-sm font-medium text-slate-500'>
                              Categoria: {entry.categoryId}
                            </span>
                          </>
                        )}
                      </div>

                      {entry.notes && (
                        <p className='mt-2 break-words text-sm leading-6 text-slate-500'>
                          {entry.notes}
                        </p>
                      )}

                      {isDebtPaymentExpense(entry) && (
                        <p className='mt-2 text-sm font-medium text-slate-500'>
                          Gerada por pagamento de dívida.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='grid gap-3 sm:justify-items-end'>
                    <MoneyDisplay
                      value={entry.amount}
                      className={
                        isIncome
                          ? 'text-left text-xl font-bold !text-emerald-700 sm:text-right'
                          : 'text-left text-xl font-bold !text-red-700 sm:text-right'
                      }
                    />

                    <span className='text-sm font-medium text-slate-500'>
                      {formatDate(entry.date)}
                    </span>

                    {(canManageIncome || canManageExpense) && (
                      <div className='grid gap-2 sm:flex sm:items-center sm:justify-end'>
                        {canManageIncome && onEditIncome && (
                          <Button
                            type='button'
                            onClick={() => onEditIncome(entry)}
                            disabled={isDeleting}
                            variant='secondary'
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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
                            className='h-10 w-full min-w-28 rounded-lg bg-white px-4 text-sm shadow-none sm:w-auto'
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
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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
                            className='h-10 w-full min-w-28 rounded-lg bg-white px-4 text-sm shadow-none sm:w-auto'
                          >
                            <Trash2 aria-hidden='true' className='size-4' />
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className='border-t border-slate-100 px-5 py-4 text-center text-sm text-slate-500'>
        Mostrando {entries.length} de {entries.length}{' '}
        {entries.length === 1 ? 'movimentação' : 'movimentações'}
      </p>
    </Card>
  );
}
