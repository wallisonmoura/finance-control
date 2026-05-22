import {
  Banknote,
  Building2,
  CircleDollarSign,
  Gauge,
  HandCoins,
  Landmark,
  WalletCards,
} from 'lucide-react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { BalanceSummaryUi } from '../types/balance-summary-ui.types';
import { Card } from '@/shared/presentation/ui/components/card';

type BalanceSummaryCardsProps = {
  summary: BalanceSummaryUi;
};

type SummaryItem = {
  label: string;
  value: number;
  description: string;
  icon: typeof Building2;
  valueClassName: string;
};

export function BalanceSummaryCards({ summary }: BalanceSummaryCardsProps) {
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
    <section
      aria-label='Resumo financeiro'
      className='space-y-6'
    >
      <Card className='border-slate-300 bg-slate-950 text-white shadow-slate-300/70'>
        <div className='grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm font-medium text-slate-300'>
              <Landmark aria-hidden='true' className='size-4' />
              <p>Saldo Final</p>
            </div>

            <div className='space-y-2'>
              <MoneyDisplay
                value={summary.finalBalance}
                className={`text-3xl !text-white sm:text-4xl ${
                  summary.finalBalance < 0 ? '!text-red-200' : ''
                }`}
              />
              <p className='max-w-2xl text-sm text-slate-300'>
                Resultado após considerar dívidas pendentes.
              </p>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:min-w-[420px]'>
            <div className='rounded-lg border border-white/10 bg-white/5 p-3'>
              <div className='flex items-center gap-2 text-xs font-medium text-slate-300'>
                <WalletCards aria-hidden='true' className='size-4' />
                <span>Wallet Total</span>
              </div>
              <MoneyDisplay
                value={summary.wallet.walletTotal}
                className='mt-2 text-xl !text-white'
              />
            </div>

            <div className='rounded-lg border border-white/10 bg-white/5 p-3'>
              <div className='flex items-center gap-2 text-xs font-medium text-slate-300'>
                <CircleDollarSign aria-hidden='true' className='size-4' />
                <span>Dívidas Pendentes</span>
              </div>
              <MoneyDisplay
                value={summary.debts.pendingDebts}
                className='mt-2 text-xl !text-red-200'
              />
            </div>
          </div>
        </div>
      </Card>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
          <Gauge aria-hidden='true' className='size-4 text-slate-500' />
          <h2>Composição dos saldos</h2>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {availableItems.map((item) => (
            <Card key={item.label}>
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm font-medium text-zinc-500'>
                  <item.icon
                    aria-hidden='true'
                    className='size-4 text-slate-500'
                  />
                  <p>{item.label}</p>
                </div>

                <MoneyDisplay
                  value={item.value}
                  className={`text-2xl font-semibold tracking-tight ${item.valueClassName}`}
                />

                <p className='text-sm text-zinc-500'>{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
