import {
  Banknote,
  Building2,
  Gauge,
  HandCoins,
  Landmark,
  WalletCards,
  BanknoteX,
} from 'lucide-react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { BalanceSummaryUi } from '../types/balance-ui.types';
import { HeroCard } from '@/shared/presentation/ui/components/hero-card';
import { TermHelp } from '@/shared/presentation/ui/components/help-popover';
import { StatCardGrid } from '@/shared/presentation/ui/components/stat-card-grid';
import type { ReactNode } from 'react';

type BalanceSummaryCardsProps = {
  summary: BalanceSummaryUi;
  // Rendered between balance composition and recent transactions. Lets the
  // page compose content from other modules (e.g. finance insights) without
  // balance depending on them.
  insightsSlot?: ReactNode;
  // Rendered after balance composition, before the insights (e.g. the finance
  // income goals strip): first what you have, then how the month is going.
  goalsSlot?: ReactNode;
  // Rendered last (e.g. the finance recent entries card).
  recentEntriesSlot?: ReactNode;
};

type SummaryItem = {
  label: string;
  value: number;
  description: string;
  icon: typeof Building2;
  valueClassName: string;
};

export function BalanceSummaryCards({
  summary,
  insightsSlot,
  goalsSlot,
  recentEntriesSlot,
}: BalanceSummaryCardsProps) {
  const availableItems: SummaryItem[] = [
    {
      label: 'Saldo em Banco',
      value: summary.wallet.bankBalance,
      description: 'Valor disponível em conta bancária.',
      icon: Building2,
      valueClassName: 'text-2xl font-semibold tracking-tight text-foreground',
    },
    {
      label: 'Saldo em Dinheiro',
      value: summary.wallet.cashBalance,
      description: 'Valor disponível em dinheiro físico.',
      icon: Banknote,
      valueClassName: 'text-2xl font-semibold tracking-tight text-foreground',
    },
    {
      label: 'Valores a Receber',
      value: summary.wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      icon: HandCoins,
      valueClassName: 'text-2xl font-semibold tracking-tight text-income',
    },
  ];

  return (
    <section aria-label='Resumo financeiro' className='space-y-7'>
      <HeroCard
        backgroundClassName='bg-[url("/images/dashboard-mobile-bg.png")] lg:bg-[url("/images/dashboard-bg.png")]'
        overlayClassName='bg-hero/25'
        contentClassName='lg:grid-cols-[1fr_auto] lg:items-center'
      >
        <div className='space-y-5'>
          <div className='flex items-center gap-3 text-sm font-medium text-hero-foreground'>
            <span className='flex size-10 items-center justify-center rounded-full bg-hero-accent/10 text-hero-accent'>
              <Landmark aria-hidden='true' className='size-5' />
            </span>
            <p>Saldo Final</p>
            <TermHelp term='finalBalance' />
          </div>

          <div className='space-y-2'>
            <MoneyDisplay
              value={summary.finalBalance}
              className={`text-4xl text-hero-foreground sm:text-5xl ${
                summary.finalBalance < 0 ? 'text-destructive' : ''
              }`}
            />
            <p className='max-w-2xl text-sm text-hero-foreground/90'>
              Resultado após considerar dívidas pendentes.
            </p>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:min-w-107.5'>
          <div className='rounded-lg border border-hero-foreground/15 bg-hero-foreground/5 p-4 shadow-sm backdrop-blur'>
            <div className='flex items-center gap-2 text-sm font-medium text-hero-foreground'>
              <WalletCards
                aria-hidden='true'
                className='size-5 text-hero-accent'
              />
              <span>Valor Total da Carteira</span>
              <TermHelp term='walletTotal' />
            </div>
            <MoneyDisplay
              value={summary.wallet.walletTotal}
              className='mt-4 text-2xl text-hero-foreground'
            />
            <p className='mt-2 text-sm text-hero-foreground/80'>
              Disponível para uso
            </p>
          </div>

          <div className='rounded-lg border border-hero-foreground/15 bg-hero-foreground/5 p-4 shadow-sm backdrop-blur'>
            <div className='flex items-center gap-2 text-sm font-medium text-hero-foreground'>
              <BanknoteX
                aria-hidden='true'
                className='size-5 text-destructive'
              />
              <span>Dívidas Pendentes</span>
              <TermHelp term='pendingDebts' />
            </div>
            <MoneyDisplay
              value={summary.debts.pendingDebts}
              className='mt-4 text-2xl text-destructive'
            />
            <p className='mt-2 text-sm text-hero-foreground/80'>
              Total a pagar
            </p>
          </div>
        </div>
      </HeroCard>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <Gauge aria-hidden='true' className='size-4 text-muted-foreground' />
          <h2>Composição dos saldos</h2>
        </div>

        <StatCardGrid items={availableItems} />
      </div>

      {goalsSlot}

      {insightsSlot}

      {recentEntriesSlot}
    </section>
  );
}
