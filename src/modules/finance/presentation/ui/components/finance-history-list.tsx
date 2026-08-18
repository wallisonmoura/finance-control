import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { cn } from '@/shared/presentation/ui/lib/utils';
import { formatDate } from '@/shared/presentation/ui/lib/format-date';

import {
  ExpenseCategoryUi,
  FinanceEntryUi,
  FinanceHistoryPaginationUi,
} from '../types/finance-ui.types';

type FinanceHistoryListProps = {
  entries: FinanceEntryUi[];
  categories?: ExpenseCategoryUi[];
  pagination?: FinanceHistoryPaginationUi;
  onPageChange?: (page: number) => void;
  onEditIncome?: (entry: FinanceEntryUi) => void;
  onDeleteIncome?: (entry: FinanceEntryUi) => void;
  onEditExpense?: (entry: FinanceEntryUi) => void;
  onDeleteExpense?: (entry: FinanceEntryUi) => void;
  deletingIncomeId?: string | null;
  deletingExpenseId?: string | null;
};

type PageWindowEntry = number | 'ellipsis';

// Janela contígua para totalPages pequeno; "1 ... 4 5 6 ... 10" a partir daí.
// Escala pessoal do app não justifica algo mais sofisticado que isso.
const MAX_CONTIGUOUS_PAGE_BUTTONS = 7;

function getPageWindow(currentPage: number, totalPages: number): PageWindowEntry[] {
  if (totalPages <= MAX_CONTIGUOUS_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const window: PageWindowEntry[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    window.push('ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    window.push(page);
  }

  if (end < totalPages - 1) {
    window.push('ellipsis');
  }

  window.push(totalPages);

  return window;
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
    ? 'bg-income-muted text-income'
    : 'bg-expense-muted text-expense';
}

function isDebtPaymentExpense(entry: FinanceEntryUi) {
  return entry.type === 'EXPENSE' && Boolean(entry.debtId);
}

function getPaginationRangeText(pagination: FinanceHistoryPaginationUi) {
  const rangeStart =
    pagination.totalCount === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalCount,
  );
  const entriesLabel =
    pagination.totalCount === 1 ? 'movimentação' : 'movimentações';

  return `Mostrando ${rangeStart}–${rangeEnd} de ${pagination.totalCount} ${entriesLabel}`;
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
  categories = [],
  pagination,
  onPageChange,
  onEditIncome,
  onDeleteIncome,
  onEditExpense,
  onDeleteExpense,
  deletingIncomeId = null,
  deletingExpenseId = null,
}: FinanceHistoryListProps) {
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

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
          <div className='flex items-center gap-2 border-b border-border bg-muted/70 px-5 py-3 text-sm font-semibold text-muted-foreground'>
            <CalendarDays aria-hidden='true' className='size-4' />
            {formatLongDate(dateEntries[0].date)}
          </div>

          <div className='divide-y divide-border'>
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
              const categoryName = entry.categoryId
                ? (categoryNameById.get(entry.categoryId) ?? null)
                : null;

              return (
                <div
                  key={entry.id}
                  className='grid gap-4 px-5 py-4 transition-colors hover:bg-muted/70 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'
                >
                  <div className='flex min-w-0 gap-4'>
                    <div
                      className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1',
                        isIncome
                          ? 'bg-income-muted text-income ring-income/20'
                          : 'bg-expense-muted text-expense ring-expense/20',
                      )}
                    >
                      <EntryIcon aria-hidden='true' className='size-6' />
                    </div>

                    <div className='min-w-0'>
                      <h3 className='wrap-break-word text-base font-semibold text-foreground'>
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

                        {categoryName && (
                          <>
                            <span className='h-4 w-px bg-border' />
                            <span className='text-sm font-medium text-muted-foreground'>
                              Categoria: {categoryName}
                            </span>
                          </>
                        )}
                      </div>

                      {entry.notes && (
                        <p className='mt-2 wrap-break-word text-sm leading-6 text-muted-foreground'>
                          {entry.notes}
                        </p>
                      )}

                      {isDebtPaymentExpense(entry) && (
                        <p className='mt-2 text-sm font-medium text-muted-foreground'>
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
                          ? 'text-left text-xl font-bold text-income sm:text-right'
                          : 'text-left text-xl font-bold text-expense sm:text-right'
                      }
                    />

                    <span className='text-sm font-medium text-muted-foreground'>
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
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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

      {pagination && (
        <div className='border-t border-border px-5 py-4'>
          <p className='text-center text-sm text-muted-foreground sm:text-left'>
            {getPaginationRangeText(pagination)}
          </p>

          {pagination.totalPages > 1 && (
            <div className='mt-3 flex flex-wrap items-center justify-center gap-1 sm:justify-end'>
              <Button
                type='button'
                variant='secondary'
                aria-label='Página anterior'
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className='size-9 rounded-lg p-0'
              >
                <ChevronLeft aria-hidden='true' className='size-4' />
              </Button>

              {getPageWindow(pagination.page, pagination.totalPages).map(
                (entry, index) =>
                  entry === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className='px-2 text-sm text-muted-foreground'
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={entry}
                      type='button'
                      variant={entry === pagination.page ? 'primary' : 'secondary'}
                      aria-label={`Página ${entry}`}
                      aria-current={entry === pagination.page ? 'page' : undefined}
                      onClick={() => onPageChange?.(entry)}
                      className='size-9 rounded-lg p-0 text-sm'
                    >
                      {entry}
                    </Button>
                  ),
              )}

              <Button
                type='button'
                variant='secondary'
                aria-label='Próxima página'
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className='size-9 rounded-lg p-0'
              >
                <ChevronRight aria-hidden='true' className='size-4' />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
