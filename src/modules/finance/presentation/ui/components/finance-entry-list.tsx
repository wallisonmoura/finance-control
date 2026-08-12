import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  CalendarDays,
  LucideIcon,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { cn } from '@/shared/presentation/ui/lib/utils';
import { formatDate } from '@/shared/presentation/ui/lib/format-date';

import { FinanceEntryTypeUi, FinanceEntryUi } from '../types/finance-ui.types';

type FinanceEntryListProps = {
  type: FinanceEntryTypeUi;
  entries: FinanceEntryUi[];
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  deletingEntryId: string | null;
  entryToDelete: FinanceEntryUi | null;
  onEdit: (entry: FinanceEntryUi) => void;
  onDelete: (entry: FinanceEntryUi) => void;
  onConfirmDelete: () => void | Promise<void>;
  onCancelDelete: () => void;
};

type FinanceEntryListConfig = {
  label: string;
  Icon: LucideIcon;
  loadingText: string;
  listTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  countSingular: string;
  countPlural: string;
  deleteDialogTitle: string;
  countBadgeClassName: string;
  typeBadgeClassName: string;
  iconWrapperClassName: string;
  cardHoverClassName: string;
  moneyClassName: string;
};

const FINANCE_ENTRY_LIST_CONFIG: Record<
  FinanceEntryTypeUi,
  FinanceEntryListConfig
> = {
  EXPENSE: {
    label: 'Despesa',
    Icon: BanknoteArrowDown,
    loadingText: 'Carregando despesas...',
    listTitle: 'Despesas cadastradas',
    emptyTitle: 'Nenhuma despesa encontrada',
    emptyDescription:
      'Registre uma despesa para visualizar saídas financeiras neste período.',
    countSingular: 'despesa encontrada',
    countPlural: 'despesas encontradas',
    deleteDialogTitle: 'Excluir despesa',
    countBadgeClassName:
      'rounded-full bg-expense-muted px-3 py-1 text-sm font-semibold text-expense',
    typeBadgeClassName:
      'rounded-full bg-expense-muted px-3 py-1 text-xs font-semibold text-expense',
    iconWrapperClassName:
      'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-expense-muted text-expense ring-1 ring-expense/20',
    cardHoverClassName: 'hover:border-expense/20',
    moneyClassName: 'text-left text-xl font-bold text-expense sm:text-right',
  },
  INCOME: {
    label: 'Receita',
    Icon: BanknoteArrowUp,
    loadingText: 'Carregando receitas...',
    listTitle: 'Receitas cadastradas',
    emptyTitle: 'Nenhuma receita encontrada',
    emptyDescription:
      'Registre uma receita para visualizar entradas financeiras neste período.',
    countSingular: 'receita encontrada',
    countPlural: 'receitas encontradas',
    deleteDialogTitle: 'Excluir receita',
    countBadgeClassName:
      'rounded-full bg-income-muted px-3 py-1 text-sm font-semibold text-income',
    typeBadgeClassName:
      'rounded-full bg-income-muted px-3 py-1 text-xs font-semibold text-income',
    iconWrapperClassName:
      'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-income-muted text-income ring-1 ring-income/20',
    cardHoverClassName: 'hover:border-income/20',
    moneyClassName: 'text-left text-xl font-bold text-income sm:text-right',
  },
};

function isDebtPaymentExpense(entry: FinanceEntryUi) {
  return entry.type === 'EXPENSE' && Boolean(entry.debtId);
}

export function FinanceEntryList({
  type,
  entries,
  isLoading,
  error,
  actionError,
  deletingEntryId,
  entryToDelete,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: FinanceEntryListProps) {
  const config = FINANCE_ENTRY_LIST_CONFIG[type];

  return (
    <>
      {isLoading && (
        <p className='text-sm text-muted-foreground'>{config.loadingText}</p>
      )}

      {error && <FormErrorMessage message={error} />}

      {actionError && <FormErrorMessage message={actionError} />}

      {!isLoading && !error && (
        <Card className='overflow-hidden p-0'>
          <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
            <h2 className='text-base font-semibold text-foreground'>
              {config.listTitle}
            </h2>
            <span className={config.countBadgeClassName}>
              {entries.length}
            </span>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title={config.emptyTitle}
              description={config.emptyDescription}
            />
          ) : (
            <div className='space-y-3 p-4 sm:p-5'>
              {entries.map((entry) => {
                const isDeleting = deletingEntryId === entry.id;
                const canManageEntry = !isDebtPaymentExpense(entry);

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'grid gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center',
                      config.cardHoverClassName,
                    )}
                  >
                    <div className='flex min-w-0 gap-4'>
                      <div className={config.iconWrapperClassName}>
                        <config.Icon aria-hidden='true' className='size-6' />
                      </div>

                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className={config.typeBadgeClassName}>
                            {config.label}
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

                        {isDebtPaymentExpense(entry) ? (
                          <p className='mt-2 text-sm font-medium text-muted-foreground'>
                            Gerada por pagamento de dívida.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className='grid gap-3 sm:justify-items-end'>
                      <MoneyDisplay
                        value={entry.amount}
                        className={config.moneyClassName}
                      />

                      {canManageEntry ? (
                        <div className='grid gap-2 sm:flex sm:items-center sm:justify-end'>
                          <Button
                            type='button'
                            onClick={() => onEdit(entry)}
                            disabled={isDeleting}
                            variant='secondary'
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
                          >
                            <Pencil aria-hidden='true' className='size-4' />
                            Editar
                          </Button>

                          <Button
                            type='button'
                            onClick={() => onDelete(entry)}
                            disabled={isDeleting}
                            variant='danger'
                            className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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

              <p className='pt-1 text-center text-sm text-muted-foreground'>
                {entries.length}{' '}
                {entries.length === 1
                  ? config.countSingular
                  : config.countPlural}
              </p>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={entryToDelete !== null}
        title={config.deleteDialogTitle}
        description={`Deseja excluir a ${config.label.toLowerCase()} "${entryToDelete?.description ?? ''}"?`}
        confirmLabel='Excluir'
        confirmingLabel='Excluindo...'
        isConfirming={deletingEntryId === entryToDelete?.id}
        onOpenChange={(open) => {
          if (!open) {
            onCancelDelete();
          }
        }}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
