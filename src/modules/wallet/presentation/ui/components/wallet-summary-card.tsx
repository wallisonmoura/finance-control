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
    <section aria-label='Resumo da Wallet' className='space-y-4'>
      <Card className='border-slate-300 bg-slate-950 text-white shadow-slate-300/70'>
        <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-center'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm font-medium text-slate-300'>
              <WalletCards aria-hidden='true' className='size-4' />
              <p>Wallet Total</p>
            </div>

            <MoneyDisplay
              value={wallet.walletTotal}
              className='text-3xl font-semibold !text-white sm:text-4xl'
            />
          </div>

          <p className='max-w-md text-sm text-slate-300 md:text-right'>
            Soma dos saldos-base informados na Wallet.
          </p>
        </div>
      </Card>

      <div className='grid gap-4 md:grid-cols-3'>
        {items.map((item) => (
          <Card key={item.label}>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm text-zinc-500'>
                <item.icon
                  aria-hidden='true'
                  className='size-4 text-slate-500'
                />
                <p>{item.label}</p>
              </div>

              <MoneyDisplay
                value={item.value}
                className='text-2xl font-semibold text-slate-950'
              />

              <p className='text-sm text-zinc-500'>{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
