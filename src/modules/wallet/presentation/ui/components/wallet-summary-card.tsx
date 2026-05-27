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
    <section aria-label='Resumo da Wallet' className='space-y-5'>
      <Card className='relative overflow-hidden border-slate-900/10 bg-primary p-0 text-white shadow-xl shadow-slate-300/80'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[url("/images/wallet-mobile-bg.png")] bg-cover bg-center lg:bg-[url("/images/wallet-bg.png")]'
        />
        <div className='absolute inset-0 bg-primary/20' aria-hidden='true' />

        <div className='relative grid min-h-48 gap-6 p-5 sm:min-h-60 sm:p-7 md:grid-cols-[1fr_auto] md:items-center'>
          <div className='space-y-5'>
            <div className='flex items-center gap-3 text-base font-medium text-white'>
              <span className='flex size-12 items-center justify-center rounded-full bg-emerald-400/10 text-[var(--fc-secondary)]'>
                <WalletCards aria-hidden='true' className='size-6' />
              </span>
              <p>Wallet Total</p>
            </div>

            <MoneyDisplay
              value={wallet.walletTotal}
              className='text-4xl font-semibold !text-white sm:text-6xl'
            />

            <p className='max-w-md text-sm text-white/90'>
              Soma dos saldos-base informados na Wallet.
            </p>
          </div>
        </div>
      </Card>

      <div className='grid gap-4 lg:grid-cols-3'>
        {items.map((item) => (
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
                  className='text-2xl font-semibold text-slate-950'
                />

                <p className='text-sm leading-6 text-slate-500'>
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
