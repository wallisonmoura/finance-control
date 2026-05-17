import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
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
      <Card>
        <p className='text-sm text-slate-500'>
          Nenhum lançamento encontrado para o período.
        </p>
      </Card>
    );
  }

  return (
    <div className='space-y-3' aria-label='Histórico financeiro'>
      {entries.map((entry) => {
        const canManageIncome =
          entry.type === 'INCOME' && (onEditIncome || onDeleteIncome);
        const canManageExpense =
          entry.type === 'EXPENSE' && (onEditExpense || onDeleteExpense);

        const isDeleting =
          deletingIncomeId === entry.id || deletingExpenseId === entry.id;

        return (
          <Card key={entry.id}>
            <div className='space-y-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-medium text-slate-500'>
                      {getEntryTypeLabel(entry.type)}
                    </span>

                    <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'>
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  <h3 className='mt-2 text-base font-semibold text-slate-900'>
                    {entry.description}
                  </h3>

                  {entry.notes && (
                    <p className='mt-1 text-sm text-slate-500'>{entry.notes}</p>
                  )}

                  {entry.categoryId && (
                    <p className='mt-1 text-xs text-slate-400'>
                      Categoria: {entry.categoryId}
                    </p>
                  )}
                </div>

                <MoneyDisplay
                  value={entry.amount}
                  className={
                    entry.type === 'INCOME'
                      ? 'text-lg font-semibold text-emerald-700'
                      : 'text-lg font-semibold text-red-700'
                  }
                />
              </div>

              {(canManageIncome || canManageExpense) && (
                <div className='flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3'>
                  {canManageIncome && onEditIncome && (
                    <Button
                      type='button'
                      onClick={() => onEditIncome(entry)}
                      disabled={isDeleting}
                    >
                      Editar
                    </Button>
                  )}

                  {canManageIncome && onDeleteIncome && (
                    <Button
                      type='button'
                      onClick={() => onDeleteIncome(entry)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}

                  {canManageExpense && onEditExpense && (
                    <Button
                      type='button'
                      onClick={() => onEditExpense(entry)}
                      disabled={isDeleting}
                    >
                      Editar
                    </Button>
                  )}

                  {canManageExpense && onDeleteExpense && (
                    <Button
                      type='button'
                      onClick={() => onDeleteExpense(entry)}
                      disabled={isDeleting}
                    >
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
