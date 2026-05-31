import {
  Banknote,
  Building2,
  Gauge,
  HandCoins,
  Landmark,
  ReceiptText,
  TrendingUp,
  WalletCards,
  BanknoteX,
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
      valueClassName: 'text-foreground',
    },
    {
      label: 'Saldo em Dinheiro',
      value: summary.wallet.cashBalance,
      description: 'Valor disponível em dinheiro físico.',
      icon: Banknote,
      valueClassName: 'text-foreground',
    },
    {
      label: 'Valores a Receber',
      value: summary.wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      icon: HandCoins,
      valueClassName: 'text-accent',
    },
  ];

  return (
    <section aria-label='Resumo financeiro' className='space-y-7'>
      <Card className='relative overflow-hidden border-primary/10 bg-primary p-0 text-primary-foreground shadow-xl shadow-border/80'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[url("/images/dashboard-mobile-bg.png")] bg-cover bg-center lg:bg-[url("/images/dashboard-bg.png")]'
        />
        <div className='absolute inset-0 bg-primary/25' aria-hidden='true' />

        <div className='relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center'>
          <div className='space-y-5'>
            <div className='flex items-center gap-3 text-sm font-medium text-primary-foreground'>
              <span className='flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
                <Landmark aria-hidden='true' className='size-5' />
              </span>
              <p>Saldo Final</p>
            </div>

            <div className='space-y-2'>
              <MoneyDisplay
                value={summary.finalBalance}
                className={`text-4xl text-primary-foreground sm:text-5xl ${
                  summary.finalBalance < 0 ? 'text-destructive' : ''
                }`}
              />
              <p className='max-w-2xl text-sm text-primary-foreground/90'>
                Resultado após considerar dívidas pendentes.
              </p>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:min-w-107.5'>
            <div className='rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4 shadow-sm backdrop-blur'>
              <div className='flex items-center gap-2 text-sm font-medium text-primary-foreground'>
                <WalletCards
                  aria-hidden='true'
                  className='size-5 text-accent'
                />
                <span>Valor Total da Carteira</span>
              </div>
              <MoneyDisplay
                value={summary.wallet.walletTotal}
                className='mt-4 text-2xl text-primary-foreground'
              />
              <p className='mt-2 text-sm text-primary-foreground/80'>
                Disponível para uso
              </p>
            </div>

            <div className='rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4 shadow-sm backdrop-blur'>
              <div className='flex items-center gap-2 text-sm font-medium text-primary-foreground'>
                <BanknoteX
                  aria-hidden='true'
                  className='size-5 text-destructive'
                />
                <span>Dívidas Pendentes</span>
              </div>
              <MoneyDisplay
                value={summary.debts.pendingDebts}
                className='mt-4 text-2xl text-destructive'
              />
              <p className='mt-2 text-sm text-primary-foreground/80'>
                Total a pagar
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <Gauge aria-hidden='true' className='size-4 text-muted-foreground' />
          <h2>Composição dos saldos</h2>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          {availableItems.map((item) => (
            <Card key={item.label} className='p-5'>
              <div className='flex gap-4 lg:block lg:space-y-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-success-light text-accent ring-1 ring-accent/20'>
                  <item.icon
                    aria-hidden='true'
                    className='size-6 text-accent'
                  />
                </div>

                <div className='min-w-0 space-y-3'>
                  <p className='text-sm font-medium text-foreground'>
                    {item.label}
                  </p>

                  <MoneyDisplay
                    value={item.value}
                    className={`text-2xl font-semibold tracking-tight ${item.valueClassName}`}
                  />

                  <p className='text-sm leading-6 text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <TrendingUp aria-hidden='true' className='size-4 text-accent' />
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
                <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] border-b border-border px-5 py-3 text-xs font-semibold text-muted-foreground'>
                  <span>Descrição</span>
                  <span>Categoria</span>
                  <span>Data</span>
                  <span className='text-right'>Valor</span>
                  <span className='text-right'>Status</span>
                </div>

                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='grid grid-cols-[1.5fr_1fr_1fr_1fr_0.7fr] items-center border-b border-border px-5 py-3 last:border-b-0'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                          entry.type === 'INCOME'
                            ? 'bg-success-light text-accent'
                            : 'bg-destructive/10 text-destructive'
                        }`}
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
                      className={`text-right text-sm font-semibold ${
                        entry.type === 'INCOME'
                          ? 'text-accent'
                          : 'text-destructive'
                      }`}
                    />
                    <span className='justify-self-end rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-accent'>
                      {getTransactionStatus(entry)}
                    </span>
                  </div>
                ))}
              </div>

              <div className='divide-y divide-border lg:hidden'>
                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='flex items-center justify-between gap-3 p-4'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                          entry.type === 'INCOME'
                            ? 'bg-success-light text-accent'
                            : 'bg-destructive/10 text-destructive'
                        }`}
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
                      className={`shrink-0 text-right text-sm font-semibold ${
                        entry.type === 'INCOME'
                          ? 'text-accent'
                          : 'text-destructive'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className='border-t border-border px-5 py-4 text-center'>
                <Link
                  href='/finance/history'
                  className='text-sm font-semibold text-foreground hover:text-accent'
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
