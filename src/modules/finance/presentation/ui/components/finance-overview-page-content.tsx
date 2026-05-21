import Link from 'next/link';
import {
  ArrowRight,
  ChartNoAxesCombined,
  History,
  ReceiptText,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

const financeLinks = [
  {
    title: 'Receitas',
    description: 'Registre e gerencie entradas financeiras realizadas.',
    href: '/finance/incomes',
    icon: TrendingUp,
  },
  {
    title: 'Despesas',
    description: 'Gerencie saídas financeiras realizadas por categoria.',
    href: '/finance/expenses',
    icon: ReceiptText,
  },
  {
    title: 'Histórico',
    description: 'Consulte receitas e despesas por período.',
    href: '/finance/history',
    icon: History,
  },
  {
    title: 'Resumo',
    description: 'Acompanhe indicadores operacionais financeiros.',
    href: '/finance/summary',
    icon: ChartNoAxesCombined,
  },
];

export function FinanceOverviewPageContent() {
  return (
    <div className='space-y-6'>
      <PageTitle
        title='Financeiro'
        description='Acesse as áreas operacionais de receitas, despesas, histórico e resumo.'
      />

      <div className='grid gap-4 md:grid-cols-2'>
        {financeLinks.map((item) => (
          <Card key={item.href} className='flex min-h-44 flex-col'>
            <div className='flex flex-1 flex-col gap-4'>
              <div className='flex items-start gap-3'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700'>
                  <item.icon aria-hidden='true' className='size-5' />
                </div>

                <div className='min-w-0'>
                  <h2 className='text-lg font-semibold text-slate-900'>
                    {item.title}
                  </h2>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>
                    {item.description}
                  </p>
                </div>
              </div>

              <div className='mt-auto'>
                <Button asChild variant='secondary' className='w-full sm:w-auto'>
                  <Link href={item.href} aria-label={`Acessar ${item.title}`}>
                    Acessar
                    <ArrowRight aria-hidden='true' className='size-4' />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
