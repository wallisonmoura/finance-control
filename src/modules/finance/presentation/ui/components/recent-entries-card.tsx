import { HandCoins, ReceiptText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { formatDate } from '@/shared/presentation/ui/lib/format-date';
import { cn } from '@/shared/presentation/ui/lib/utils';

import { FinanceEntryUi } from '../types/finance-ui.types';

type RecentEntriesCardProps = {
  entries: FinanceEntryUi[];
};

function getTransactionStatus(entry: FinanceEntryUi) {
  return entry.type === 'INCOME' ? 'Recebido' : 'Pago';
}

function getTransactionDisplayValue(entry: FinanceEntryUi) {
  return entry.type === 'INCOME' ? entry.amount : -entry.amount;
}

function getTransactionToneClassName(entry: FinanceEntryUi) {
  return entry.type === 'INCOME'
    ? 'bg-income-muted text-income'
    : 'bg-expense-muted text-expense';
}

function getTransactionValueClassName(entry: FinanceEntryUi) {
  return entry.type === 'INCOME' ? 'text-income' : 'text-expense';
}

function TransactionIcon({ type }: { type: FinanceEntryUi['type'] }) {
  if (type === 'INCOME') {
    return <HandCoins aria-hidden='true' className='size-4' />;
  }

  return <ReceiptText aria-hidden='true' className='size-4' />;
}

// The dashboard's "Transações recentes": the newest entries from any month.
export function RecentEntriesCard({ entries }: RecentEntriesCardProps) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <TrendingUp aria-hidden='true' className='size-4 text-income' />
        <h2>Transações recentes</h2>
      </div>

      <Card className='overflow-hidden p-0'>
        {entries.length === 0 ? (
          <p className='p-5 text-sm text-muted-foreground'>
            Nenhuma transação registrada ainda.
          </p>
        ) : (
          <>
            <div className='hidden lg:block'>
              <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] border-b border-border px-5 py-3 text-xs font-semibold text-muted-foreground'>
                <span>Descrição</span>
                <span>Categoria</span>
                <span>Data</span>
                <span className='text-right'>Valor</span>
                <span className='text-right'>Status</span>
              </div>

              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] items-center border-b border-border px-5 py-3 last:border-b-0'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                        getTransactionToneClassName(entry),
                      )}
                    >
                      <TransactionIcon type={entry.type} />
                    </span>
                    <span className='truncate text-sm font-medium text-foreground'>
                      {entry.description}
                    </span>
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {entry.type === 'INCOME' ? 'Receitas' : 'Despesas'}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {formatDate(entry.date)}
                  </span>
                  <MoneyDisplay
                    value={getTransactionDisplayValue(entry)}
                    className={cn(
                      'text-right text-sm font-semibold',
                      getTransactionValueClassName(entry),
                    )}
                  />
                  <span
                    className={cn(
                      'justify-self-end rounded-full px-3 py-1 text-xs font-semibold',
                      getTransactionToneClassName(entry),
                    )}
                  >
                    {getTransactionStatus(entry)}
                  </span>
                </div>
              ))}
            </div>

            <div className='divide-y divide-border lg:hidden'>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-center justify-between gap-3 p-4'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full',
                        getTransactionToneClassName(entry),
                      )}
                    >
                      <TransactionIcon type={entry.type} />
                    </span>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium text-foreground'>
                        {entry.description}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  <MoneyDisplay
                    value={getTransactionDisplayValue(entry)}
                    className={cn(
                      'shrink-0 text-right text-sm font-semibold',
                      getTransactionValueClassName(entry),
                    )}
                  />
                </div>
              ))}
            </div>

            <div className='border-t border-border px-5 py-4 text-center'>
              <Link
                href='/finance/history'
                className='text-sm font-semibold text-foreground hover:text-income'
              >
                Ver todas as transações
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
