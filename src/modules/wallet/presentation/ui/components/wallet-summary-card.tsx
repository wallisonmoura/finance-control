import { Banknote, Building2, HandCoins, WalletCards } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

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
      <Card className='relative overflow-hidden border-primary/10 bg-primary p-0 text-primary-foreground shadow-xl shadow-border/80'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[url("/images/wallet-mobile-bg.png")] bg-cover bg-center lg:bg-[url("/images/wallet-bg.png")]'
        />
        <div className='absolute inset-0 bg-primary/20' aria-hidden='true' />

        <div className='relative grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center'>
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
        </div>
      </Card>

      <div className='grid gap-4 lg:grid-cols-3'>
        {items.map((item) => (
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
                  className='text-2xl font-semibold text-foreground'
                />

                <p className='text-sm leading-6 text-muted-foreground'>
                  {item.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
