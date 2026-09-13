import {
  BarChart3,
  ChartNoAxesCombined,
  CircleDollarSign,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: WalletCards,
    title: 'Carteira',
    description:
      'Saldo em banco, dinheiro e valores a receber, sempre atualizados — a base real da sua situação financeira, não só o que passou pelo extrato.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Financeiro',
    description:
      'Registre receitas e despesas por categoria. Histórico completo e resumo mensal automático.',
  },
  {
    icon: CircleDollarSign,
    title: 'Dívidas',
    description:
      'Cadastre à vista, parcelada ou recorrente. Ao pagar, o sistema debita sua carteira e lança a despesa sozinho — sem retrabalho.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    description:
      'Gastos por categoria, evolução de receita e despesa, dívidas pagas — em gráfico, não em planilha.',
  },
];

export function AboutFeatures() {
  return (
    <section className='bg-background'>
      <div className='mx-auto max-w-6xl px-6 py-16 lg:py-24'>
        <h2 className='text-3xl font-bold tracking-tight text-foreground'>
          O que você consegue fazer
        </h2>

        <div className='mt-10 grid gap-6 sm:grid-cols-2'>
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className='rounded-2xl border border-border bg-card p-6'
            >
              <span className='flex size-11 items-center justify-center rounded-full bg-income-muted text-income'>
                <feature.icon aria-hidden='true' className='size-5' />
              </span>

              <h3 className='mt-4 text-lg font-semibold text-foreground'>
                {feature.title}
              </h3>

              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
