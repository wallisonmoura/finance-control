import { Banknote, Building2, HandCoins, WalletCards } from 'lucide-react';

import { HeroCard } from '@/shared/presentation/ui/components/hero-card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { StatCardGrid } from '@/shared/presentation/ui/components/stat-card-grid';

import { WalletUi } from '../types/wallet-ui.types';

type WalletSummaryCardProps = {
  wallet: WalletUi;
};

export function WalletSummaryCard({ wallet }: WalletSummaryCardProps) {
  const items = [
    {
      label: 'Saldo em Banco',
      value: wallet.bankBalance,
      description: 'Valor disponível em conta bancária.',
      icon: Building2,
    },
    {
      label: 'Saldo em Dinheiro',
      value: wallet.cashBalance,
      description: 'Valor disponível em espécie.',
      icon: Banknote,
    },
    {
      label: 'Valores a Receber',
      value: wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      icon: HandCoins,
    },
  ];

  return (
    <section aria-label='Resumo da Carteira' className='space-y-5'>
      <HeroCard
        backgroundClassName='bg-[url("/images/wallet-mobile-bg.png")] lg:bg-[url("/images/wallet-bg.png")]'
        overlayClassName='bg-primary/20'
        contentClassName='md:grid-cols-[1fr_auto] md:items-center'
      >
        <div className='space-y-5'>
          <div className='flex items-center gap-3 text-sm font-medium text-primary-foreground'>
            <span className='flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
              <WalletCards aria-hidden='true' className='size-5' />
            </span>
            <p>Valor Total da Carteira</p>
          </div>

          <MoneyDisplay
            value={wallet.walletTotal}
            className='text-4xl font-semibold text-primary-foreground sm:text-5xl'
          />

          <p className='max-w-md text-sm text-primary-foreground/90'>
            Soma dos saldos-base informados na carteira.
          </p>
        </div>
      </HeroCard>

      <StatCardGrid items={items} />
    </section>
  );
}
