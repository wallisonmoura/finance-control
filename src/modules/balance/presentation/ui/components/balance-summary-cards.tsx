import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { BalanceSummaryUi } from '../types/balance-summary-ui.types';
import { Card } from '@/shared/presentation/ui/components/card';

type BalanceSummaryCardsProps = {
  summary: BalanceSummaryUi;
};

export function BalanceSummaryCards({ summary }: BalanceSummaryCardsProps) {
  const items = [
    {
      label: 'Wallet Total',
      value: summary.wallet.walletTotal,
      description: 'Soma dos saldos-base da wallet.',
      highlight: false,
    },
    {
      label: 'Dívidas Pendentes',
      value: summary.debts.pendingDebts,
      description: 'Total de compromissos ainda em aberto.',
      highlight: false,
    },
    {
      label: 'Saldo Final',
      value: summary.finalBalance,
      description: 'Resultado após considerar dívidas pendentes.',
      highlight: true,
    },
    {
      label: 'Saldo em Banco',
      value: summary.wallet.bankBalance,
      description: 'Valor disponível em conta bancária.',
      highlight: false,
    },
    {
      label: 'Saldo em Dinheiro',
      value: summary.wallet.cashBalance,
      description: 'Valor disponível em dinheiro físico.',
      highlight: false,
    },
    {
      label: 'Valores a Receber',
      value: summary.wallet.receivableBalance,
      description: 'Valores previstos para recebimento.',
      highlight: false,
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
          className={item.highlight ? 'border-2' : undefined}
        >
          <div className='space-y-2'>
            <p className='text-sm font-medium text-zinc-500'>{item.label}</p>

            <MoneyDisplay
              value={item.value}
              className='text-2xl font-semibold tracking-tight'
            />

            <p className='text-sm text-zinc-500'>{item.description}</p>
          </div>
        </Card>
      ))}
    </section>
  );
}
