import {
  Banknote,
  Building2,
  CircleDollarSign,
  Gauge,
  HandCoins,
  Landmark,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from 'lucide-react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { BalanceSummaryUi } from '../types/balance-summary-ui.types';
import { Card } from '@/shared/presentation/ui/components/card';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import Link from 'next/link';

type BalanceSummaryCardsProps = {
  summary: BalanceSummaryUi;
  recentEntries?: FinanceEntryUi[];
};

type SummaryItem = {
  label: string;
  value: number;
  description: string;
  icon: typeof Building2;
  valueClassName: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

function getTransactionStatus(entry: FinanceEntryUi) {
  return entry.type === 'INCOME' ? 'Recebido' : 'Pago';
}

function getTransactionDisplayValue(entry: FinanceEntryUi) {
  return entry.type === 'INCOME' ? entry.amount : -entry.amount;
}

function TransactionIcon({ type }: { type: FinanceEntryUi['type'] }) {
  if (type === 'INCOME') {
    return <HandCoins aria-hidden='true' className='size-4' />;
  }

  return <ReceiptText aria-hidden='true' className='size-4' />;
}

export function BalanceSummaryCards({
  summary,
  recentEntries = [],
}: BalanceSummaryCardsProps) {
  const availableItems: SummaryItem[] = [
    {
      label: 'Saldo em Banco',
      value: summary.wallet.bankBalance,
      description: 'Valor disponível em conta bancária.',
      icon: Building2,
      valueClassName: 'text-slate-950',
    },
    {
      label: 'Saldo em Dinheiro',
      value: summary.wallet.cashBalance,
      description: 'Valor disponível em dinheiro físico.',
      icon: Banknote,
      valueClassName: 'text-slate-950',
    },
    {
      label: 'Valores a Receber',
      value: summary.wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      icon: HandCoins,
      valueClassName: 'text-emerald-700',
    },
  ];

  return (
    <section aria-label='Resumo financeiro' className='space-y-7'>
      <Card className='relative overflow-hidden border-slate-900/10 bg-primary p-0 text-white shadow-xl shadow-slate-300/80'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[url("/images/dashboard-mobile-bg.png")] bg-cover bg-center lg:bg-[url("/images/dashboard-bg.png")]'
        />
        <div className='absolute inset-0 bg-primary/25' aria-hidden='true' />

        <div className='relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center'>
          <div className='space-y-5'>
            <div className='flex items-center gap-3 text-sm font-medium text-white'>
              <span className='flex size-10 items-center justify-center rounded-full bg-emerald-400/10 text-[var(--fc-secondary)]'>
                <Landmark aria-hidden='true' className='size-5' />
              </span>
              <p>Saldo Final</p>
            </div>

            <div className='space-y-2'>
              <MoneyDisplay
                value={summary.finalBalance}
                className={`text-4xl !text-white sm:text-5xl ${
                  summary.finalBalance < 0 ? '!text-red-300' : ''
                }`}
              />
              <p className='max-w-2xl text-sm text-white/90'>
                Resultado após considerar dívidas pendentes.
              </p>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:min-w-[430px]'>
            <div className='rounded-lg border border-white/15 bg-white/5 p-4 shadow-sm backdrop-blur'>
              <div className='flex items-center gap-2 text-sm font-medium text-white'>
                <WalletCards
                  aria-hidden='true'
                  className='size-5 text-[var(--fc-secondary)]'
                />
                <span>Wallet Total</span>
              </div>
              <MoneyDisplay
                value={summary.wallet.walletTotal}
                className='mt-4 text-2xl !text-white'
              />
              <p className='mt-2 text-sm text-white/80'>Disponível para uso</p>
            </div>

            <div className='rounded-lg border border-white/15 bg-white/5 p-4 shadow-sm backdrop-blur'>
              <div className='flex items-center gap-2 text-sm font-medium text-white'>
                <CircleDollarSign
                  aria-hidden='true'
                  className='size-5 text-[var(--fc-secondary)]'
                />
                <span>Dívidas Pendentes</span>
              </div>
              <MoneyDisplay
                value={summary.debts.pendingDebts}
                className='mt-4 text-2xl !text-red-300'
              />
              <p className='mt-2 text-sm text-white/80'>Total a pagar</p>
            </div>
          </div>
        </div>
      </Card>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-950'>
          <Gauge aria-hidden='true' className='size-4 text-slate-600' />
          <h2>Composição dos saldos</h2>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          {availableItems.map((item) => (
            <Card key={item.label} className='p-5'>
              <div className='flex gap-4 lg:block lg:space-y-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'>
                  <item.icon
                    aria-hidden='true'
                    className='size-6 text-emerald-600'
                  />
                </div>

                <div className='min-w-0 space-y-3'>
                  <p className='text-sm font-medium text-slate-700'>
                    {item.label}
                  </p>

                  <MoneyDisplay
                    value={item.value}
                    className={`text-2xl font-semibold tracking-tight ${item.valueClassName}`}
                  />

                  <p className='text-sm leading-6 text-slate-500'>
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-950'>
          <TrendingUp aria-hidden='true' className='size-4 text-emerald-600' />
          <h2>Transações recentes</h2>
        </div>

        <Card className='overflow-hidden p-0'>
          {recentEntries.length === 0 ? (
            <p className='p-5 text-sm text-muted-foreground'>
              Nenhuma transação registrada neste mês.
            </p>
          ) : (
            <>
              <div className='hidden lg:block'>
                <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] border-b border-slate-200 px-5 py-3 text-xs font-semibold text-slate-700'>
                  <span>Descrição</span>
                  <span>Categoria</span>
                  <span>Data</span>
                  <span className='text-right'>Valor</span>
                  <span className='text-right'>Status</span>
                </div>

                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] items-center border-b border-slate-100 px-5 py-3 last:border-b-0'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                          entry.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        <TransactionIcon type={entry.type} />
                      </span>
                      <span className='truncate text-sm font-medium text-slate-950'>
                        {entry.description}
                      </span>
                    </div>
                    <span className='text-sm text-slate-600'>
                      {entry.type === 'INCOME' ? 'Receitas' : 'Despesas'}
                    </span>
                    <span className='text-sm text-slate-600'>
                      {formatDate(entry.date)}
                    </span>
                    <MoneyDisplay
                      value={getTransactionDisplayValue(entry)}
                      className={`text-right text-sm font-semibold ${
                        entry.type === 'INCOME'
                          ? '!text-emerald-700'
                          : '!text-red-600'
                      }`}
                    />
                    <span className='justify-self-end rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'>
                      {getTransactionStatus(entry)}
                    </span>
                  </div>
                ))}
              </div>

              <div className='divide-y divide-slate-100 lg:hidden'>
                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='flex items-center justify-between gap-3 p-4'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                          entry.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        <TransactionIcon type={entry.type} />
                      </span>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium text-slate-950'>
                          {entry.description}
                        </p>
                        <p className='text-xs text-slate-500'>
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <MoneyDisplay
                      value={getTransactionDisplayValue(entry)}
                      className={`shrink-0 text-right text-sm font-semibold ${
                        entry.type === 'INCOME'
                          ? '!text-emerald-700'
                          : '!text-red-600'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className='border-t border-slate-100 px-5 py-4 text-center'>
                <Link
                  href='/finance/history'
                  className='text-sm font-semibold text-slate-950 hover:text-[var(--fc-secondary)]'
                >
                  Ver todas as transações
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
