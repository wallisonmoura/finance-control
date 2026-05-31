import Link from 'next/link';
import {
  ArrowRight,
  History,
  TrendingDown,
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
    icon: TrendingDown,
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
      card: 'border-t-[3px] border-t-income',
      icon: 'bg-income-muted text-income',
      button:
        'bg-income-muted text-income hover:bg-income-muted/80 hover:text-income',
    },
    expense: {
      card: 'border-t-[3px] border-t-expense',
      icon: 'bg-expense-muted text-expense',
      button: 'bg-expense-muted text-expense hover:bg-expense-muted/80',
    },
    history: {
      card: 'border-t-[3px] border-t-info',
      icon: 'bg-info-muted text-info',
      button:
        'bg-info-muted text-info hover:bg-info-muted/80 hover:text-info',
    },
    summary: {
      card: 'border-t-[3px] border-t-warning',
      icon: 'bg-warning-muted text-warning',
      button:
        'bg-warning-muted text-warning hover:bg-warning-muted/80 hover:text-warning',
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
              className={`flex min-h-44 flex-col p-4 shadow-sm shadow-border/70 ${tone.card}`}
            >
              <div className='flex flex-1 flex-col gap-4'>
                <div className='flex items-start gap-3'>
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
                  >
                    <item.icon aria-hidden='true' className='size-5' />
                  </div>

                  <div className='min-w-0'>
                    <h2 className='text-lg font-semibold text-foreground'>
                      {item.title}
                    </h2>
                    <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className='mt-auto'>
                  <Button
                    asChild
                    variant='custom'
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
