import Link from 'next/link';
import {
  ArrowRight,
  History,
  ReceiptText,
  TrendingUp,
  ChartPie,
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
    tone: 'income',
  },
  {
    title: 'Despesas',
    description: 'Gerencie saídas financeiras realizadas por categoria.',
    href: '/finance/expenses',
    icon: ReceiptText,
    tone: 'expense',
  },
  {
    title: 'Histórico',
    description: 'Consulte movimentações financeiras por período.',
    href: '/finance/history',
    icon: History,
    tone: 'history',
  },
  {
    title: 'Resumo',
    description: 'Acompanhe indicadores operacionais financeiros.',
    href: '/finance/summary',
    icon: ChartPie,
    tone: 'summary',
  },
];

export function FinanceOverviewPageContent() {
  const toneClassNames = {
    income: {
      card: 'border-t-[3px] border-t-emerald-500',
      icon: 'bg-emerald-50 text-emerald-600',
      button:
        'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800',
    },
    expense: {
      card: 'border-t-[3px] border-t-red-500',
      icon: 'bg-red-50 text-red-600',
      button: 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700',
    },
    history: {
      card: 'border-t-[3px] border-t-blue-500',
      icon: 'bg-blue-50 text-blue-600',
      button: 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700',
    },
    summary: {
      card: 'border-t-[3px] border-t-amber-500',
      icon: 'bg-amber-50 text-amber-600',
      button:
        'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700',
    },
  };

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Financeiro'
        description='Acesse as áreas operacionais de receitas, despesas, histórico e resumo.'
      />

      <div className='grid gap-4 md:grid-cols-2'>
        {financeLinks.map((item) => {
          const tone = toneClassNames[item.tone as keyof typeof toneClassNames];

          return (
            <Card
              key={item.href}
              className={`flex min-h-44 flex-col p-4 shadow-sm shadow-slate-200/70 ${tone.card}`}
            >
              <div className='flex flex-1 flex-col gap-4'>
                <div className='flex items-start gap-3'>
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
                  >
                    <item.icon aria-hidden='true' className='size-5' />
                  </div>

                  <div className='min-w-0'>
                    <h2 className='text-lg font-semibold text-slate-950'>
                      {item.title}
                    </h2>
                    <p className='mt-1 text-sm leading-6 text-slate-600'>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className='mt-auto'>
                  <Button
                    asChild
                    variant='secondary'
                    className={`h-9 w-full justify-between border-0 px-4 text-sm font-semibold shadow-none sm:w-auto ${tone.button}`}
                  >
                    <Link href={item.href} aria-label={`Acessar ${item.title}`}>
                      Acessar
                      <ArrowRight aria-hidden='true' className='size-4' />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
