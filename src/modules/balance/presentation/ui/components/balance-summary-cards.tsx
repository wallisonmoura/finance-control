import {
  Banknote,
  Building2,
  CircleDollarSign,
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

export function BalanceSummaryCards({ summary }: BalanceSummaryCardsProps) {
  const items = [
    {
      label: 'Saldo em Banco',
      value: summary.wallet.bankBalance,
      description: 'Valor disponível em conta bancária.',
      icon: Building2,
      valueClassName: 'text-slate-950',
      highlight: false,
    },
    {
      label: 'Saldo em Dinheiro',
      value: summary.wallet.cashBalance,
      description: 'Valor disponível em dinheiro físico.',
      icon: Banknote,
      valueClassName: 'text-slate-950',
      highlight: false,
    },
    {
      label: 'Valores a Receber',
      value: summary.wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      icon: HandCoins,
      valueClassName: 'text-emerald-700',
      highlight: false,
    },
    {
      label: 'Wallet Total',
      value: summary.wallet.walletTotal,
      description: 'Soma dos saldos-base da Wallet.',
      icon: WalletCards,
      valueClassName: 'text-slate-950',
      highlight: false,
    },
    {
      label: 'Dívidas Pendentes',
      value: summary.debts.pendingDebts,
      description: 'Total de compromissos ainda em aberto.',
      icon: CircleDollarSign,
      valueClassName: 'text-red-700',
      highlight: false,
    },
    {
      label: 'Saldo Final',
      value: summary.finalBalance,
      description: 'Resultado após considerar dívidas pendentes.',
      icon: Landmark,
      valueClassName:
        summary.finalBalance >= 0 ? 'text-emerald-700' : 'text-red-700',
      highlight: true,
    },
  ];

  return (
    <section
      aria-label='Resumo financeiro'
      className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
    >
      {items.map((item) => (
        <Card
          key={item.label}
          className={
            item.highlight
              ? 'border-2 border-slate-300 shadow-slate-300/60'
              : undefined
          }
        >
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm font-medium text-zinc-500'>
              <item.icon aria-hidden='true' className='size-4 text-slate-500' />
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
    </section>
  );
}
