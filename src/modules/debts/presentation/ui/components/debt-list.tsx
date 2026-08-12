import type { ReactNode } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { cn } from '@/shared/presentation/ui/lib/utils';
import { formatDate } from '@/shared/presentation/ui/lib/format-date';

import { DebtUi } from '../types/debt-ui.types';

type DebtListProps = {
  debts: DebtUi[];
  onPayDebt?: (debt: DebtUi) => void;
  onEditDebt?: (debt: DebtUi) => void;
  onDeleteDebt?: (debt: DebtUi) => void;
  deletingDebtId?: string | null;
  expandedDebtId?: string | null;
  renderExpandedContent?: (debt: DebtUi) => ReactNode;
  title?: string | null;
};

function getDebtTypeLabel(type: DebtUi['type']) {
  return type === 'ONE_TIME' ? 'Única' : 'Recorrente';
}

function getDebtStatusLabel(status: DebtUi['status']) {
  return status === 'PENDING' ? 'Pendente' : 'Paga';
}

function getDebtStatusClassName(status: DebtUi['status']) {
  return status === 'PENDING'
    ? 'bg-warning-muted text-warning ring-warning/20'
    : 'bg-income-muted text-income ring-income/20';
}

function getPaymentSourceLabel(source: DebtUi['paymentSource']) {
  if (source === 'BANK') {
    return 'Banco';
  }

  if (source === 'CASH') {
    return 'Dinheiro';
  }

  if (source === 'RECEIVABLE') {
    return 'Recebíveis';
  }

  return null;
}

function getDebtSortDate(debt: DebtUi) {
  if (debt.status === 'PAID') {
    return debt.paidAt ?? debt.dueDate;
  }

  return debt.dueDate;
}

function getDebtTieBreakDate(debt: DebtUi) {
  return debt.updatedAt || debt.createdAt;
}

function sortDebtsForDisplay(debts: DebtUi[]) {
  return [...debts].sort((firstDebt, secondDebt) => {
    if (firstDebt.status !== secondDebt.status) {
      return firstDebt.status === 'PENDING' ? -1 : 1;
    }

    const firstDate = getDebtSortDate(firstDebt);
    const secondDate = getDebtSortDate(secondDebt);

    if (firstDebt.status === 'PAID') {
      const paidDateComparison = secondDate.localeCompare(firstDate);

      if (paidDateComparison !== 0) {
        return paidDateComparison;
      }

      return getDebtTieBreakDate(secondDebt).localeCompare(
        getDebtTieBreakDate(firstDebt),
      );
    }

    const dueDateComparison = firstDate.localeCompare(secondDate);

    if (dueDateComparison !== 0) {
      return dueDateComparison;
    }

    return getDebtTieBreakDate(secondDebt).localeCompare(
      getDebtTieBreakDate(firstDebt),
    );
  });
}

export function DebtList({
  debts,
  onPayDebt,
  onEditDebt,
  onDeleteDebt,
  deletingDebtId = null,
  expandedDebtId = null,
  renderExpandedContent,
  title = 'Dívidas cadastradas',
}: DebtListProps) {
  if (debts.length === 0) {
    return (
      <EmptyState
        title='Nenhuma dívida encontrada'
        description='Cadastre uma nova dívida ou ajuste a visualização para acompanhar compromissos pendentes e pagos.'
      />
    );
  }

  return (
    <section className='space-y-4' aria-label='Lista de dívidas'>
      {title ? (
        <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
      ) : null}

      {sortDebtsForDisplay(debts).map((debt) => {
        const canManageDebt =
          debt.status === 'PENDING' &&
          (onPayDebt || onEditDebt || onDeleteDebt);
        const isDeleting = deletingDebtId === debt.id;
        const isPaid = debt.status === 'PAID';
        const isExpanded = expandedDebtId === debt.id;

        return (
          <Card
            key={debt.id}
            className={cn(
              'p-5 transition-all hover:shadow-md',
              isPaid
                ? 'border-l-4 border-l-income'
                : 'hover:border-warning/30',
            )}
          >
            <div className='space-y-5'>
              <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold ring-1',
                        getDebtStatusClassName(debt.status),
                      )}
                    >
                      {getDebtStatusLabel(debt.status)}
                    </span>

                    <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
                      {getDebtTypeLabel(debt.type)}
                    </span>

                    <span className='inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
                      <CalendarDays aria-hidden='true' className='size-3.5' />
                      Vence em {formatDate(debt.dueDate)}
                    </span>
                  </div>

                  <h3 className='mt-4 wrap-break-word text-lg font-semibold text-foreground'>
                    {debt.description}
                  </h3>

                  {debt.notes && (
                    <p className='mt-2 wrap-break-word text-sm leading-6 text-muted-foreground'>
                      {debt.notes}
                    </p>
                  )}
                </div>

                <div className='grid gap-4 sm:justify-items-end'>
                  <MoneyDisplay
                    value={debt.amount}
                    className={
                      isPaid
                        ? 'text-left text-xl font-bold text-income sm:text-right'
                        : 'text-left text-xl font-bold text-foreground sm:text-right'
                    }
                  />

                  {debt.paidAt ? (
                    <div className='grid gap-3 sm:justify-items-end'>
                      <p className='inline-flex items-center gap-2 rounded-lg bg-income-muted px-3 py-2 text-sm font-semibold text-income'>
                        <CheckCircle2 aria-hidden='true' className='size-4' />
                        Pago em {formatDate(debt.paidAt)}
                      </p>
                      {getPaymentSourceLabel(debt.paymentSource) ? (
                        <p className='text-sm text-muted-foreground'>
                          Origem:{' '}
                          <strong className='text-foreground'>
                            {getPaymentSourceLabel(debt.paymentSource)}
                          </strong>
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {canManageDebt && !isExpanded && (
                    <div className='grid gap-2 sm:flex sm:items-center sm:justify-end'>
                      {onPayDebt && (
                        <Button
                          type='button'
                          onClick={() => onPayDebt(debt)}
                          disabled={isDeleting}
                          variant='custom'
                          className='h-10 w-full min-w-28 rounded-lg bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto'
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
                          className='h-10 w-full min-w-28 rounded-lg px-4 text-sm shadow-none sm:w-auto'
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

              {isExpanded && renderExpandedContent
                ? renderExpandedContent(debt)
                : null}
            </div>
          </Card>
        );
      })}
    </section>
  );
}
