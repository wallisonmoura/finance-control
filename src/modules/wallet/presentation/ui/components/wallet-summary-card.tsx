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
        <div className='space-y-2'>
          <p className='text-sm text-zinc-500'>Wallet Total</p>

          <MoneyDisplay
            value={wallet.walletTotal}
            className='text-3xl font-semibold'
          />

          <p className='text-sm text-zinc-500'>
            Soma dos saldos-base informados na Wallet.
          </p>
        </div>
      </Card>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-500'>Saldo em Banco</p>

            <MoneyDisplay
              value={wallet.bankBalance}
              className='text-2xl font-semibold'
            />

            <p className='text-sm text-zinc-500'>
              Valor disponível em conta bancária.
            </p>
          </div>
        </Card>

        <Card>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-500'>Saldo em Dinheiro</p>

            <MoneyDisplay
              value={wallet.cashBalance}
              className='text-2xl font-semibold'
            />

            <p className='text-sm text-zinc-500'>
              Valor disponível em espécie.
            </p>
          </div>
        </Card>

        <Card>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-500'>Valores a Receber</p>

            <MoneyDisplay
              value={wallet.receivableBalance}
              className='text-2xl font-semibold'
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
