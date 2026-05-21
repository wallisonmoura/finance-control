import { CreditCard, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { DebtUi } from '../types/debt-ui.types';

type DebtListProps = {
  debts: DebtUi[];
  onPayDebt?: (debt: DebtUi) => void;
  onEditDebt?: (debt: DebtUi) => void;
  onDeleteDebt?: (debt: DebtUi) => void;
  deletingDebtId?: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

function getDebtTypeLabel(type: DebtUi['type']) {
  return type === 'ONE_TIME' ? 'Única' : 'Recorrente';
}

function getDebtStatusLabel(status: DebtUi['status']) {
  return status === 'PENDING' ? 'Pendente' : 'Paga';
}

function getDebtStatusClassName(status: DebtUi['status']) {
  return status === 'PENDING'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-emerald-100 text-emerald-800';
}

export function DebtList({
  debts,
  onPayDebt,
  onEditDebt,
  onDeleteDebt,
  deletingDebtId = null,
}: DebtListProps) {
  if (debts.length === 0) {
    return <EmptyState description='Nenhuma dívida encontrada.' />;
  }

  return (
    <div className='space-y-3' aria-label='Lista de dívidas'>
      {debts.map((debt) => {
        const canManageDebt =
          debt.status === 'PENDING' &&
          (onPayDebt || onEditDebt || onDeleteDebt);
        const isDeleting = deletingDebtId === debt.id;

        return (
          <Card key={debt.id}>
            <div className='space-y-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-medium',
                        getDebtStatusClassName(debt.status),
                      ].join(' ')}
                    >
                      {getDebtStatusLabel(debt.status)}
                    </span>

                    <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'>
                      {getDebtTypeLabel(debt.type)}
                    </span>

                    <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'>
                      Vence em {formatDate(debt.dueDate)}
                    </span>
                  </div>

                  <h3 className='mt-2 break-words text-base font-semibold text-slate-900'>
                    {debt.description}
                  </h3>

                  {debt.notes && (
                    <p className='mt-1 break-words text-sm text-slate-500'>
                      {debt.notes}
                    </p>
                  )}

                  {debt.paidAt && (
                    <p className='mt-1 text-xs text-slate-400'>
                      Paga em {formatDate(debt.paidAt)}
                    </p>
                  )}
                </div>

                <MoneyDisplay
                  value={debt.amount}
                  className='text-lg font-semibold text-red-700 sm:text-right'
                />
              </div>

              {canManageDebt && (
                <div className='grid gap-2 border-t border-slate-100 pt-3 sm:flex sm:flex-wrap sm:justify-end'>
                  {onPayDebt && (
                    <Button
                      type='button'
                      onClick={() => onPayDebt(debt)}
                      disabled={isDeleting}
                      className='w-full sm:w-auto'
                    >
                      <CreditCard aria-hidden='true' className='size-4' />
                      Pagar
                    </Button>
                  )}

                  {onEditDebt && (
                    <Button
                      type='button'
                      onClick={() => onEditDebt(debt)}
                      disabled={isDeleting}
                      variant='secondary'
                      className='w-full sm:w-auto'
                    >
                      <Pencil aria-hidden='true' className='size-4' />
                      Editar
                    </Button>
                  )}

                  {onDeleteDebt && (
                    <Button
                      type='button'
                      onClick={() => onDeleteDebt(debt)}
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
