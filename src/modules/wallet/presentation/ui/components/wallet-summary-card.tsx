import { Banknote, Building2, HandCoins, WalletCards } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { WalletUi } from '../types/wallet-ui.types';

type WalletSummaryCardProps = {
  wallet: WalletUi;
};

export function WalletSummaryCard({ wallet }: WalletSummaryCardProps) {
  return (
    <section aria-label='Resumo da Wallet' className='grid gap-4'>
      <Card>
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-sm text-zinc-500'>
            <WalletCards aria-hidden='true' className='size-4 text-slate-500' />
            <p>Wallet Total</p>
          </div>

          <MoneyDisplay
            value={wallet.walletTotal}
            className='text-3xl font-semibold text-slate-950'
          />

          <p className='text-sm text-zinc-500'>
            Soma dos saldos-base informados na Wallet.
          </p>
        </div>
      </Card>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-zinc-500'>
              <Building2 aria-hidden='true' className='size-4 text-slate-500' />
              <p>Saldo em Banco</p>
            </div>

            <MoneyDisplay
              value={wallet.bankBalance}
              className='text-2xl font-semibold text-slate-950'
            />

            <p className='text-sm text-zinc-500'>
              Valor disponível em conta bancária.
            </p>
          </div>
        </Card>

        <Card>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-zinc-500'>
              <Banknote aria-hidden='true' className='size-4 text-slate-500' />
              <p>Saldo em Dinheiro</p>
            </div>

            <MoneyDisplay
              value={wallet.cashBalance}
              className='text-2xl font-semibold text-slate-950'
            />

            <p className='text-sm text-zinc-500'>
              Valor disponível em espécie.
            </p>
          </div>
        </Card>

        <Card>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-zinc-500'>
              <HandCoins aria-hidden='true' className='size-4 text-slate-500' />
              <p>Valores a Receber</p>
            </div>

            <MoneyDisplay
              value={wallet.receivableBalance}
              className='text-2xl font-semibold text-slate-950'
            />

            <p className='text-sm text-zinc-500'>
              Valores previstos para recebimento.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
