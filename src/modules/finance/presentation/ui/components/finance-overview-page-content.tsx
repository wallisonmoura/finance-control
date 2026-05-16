import Link from 'next/link';

import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

const financeLinks = [
  {
    title: 'Receitas',
    description: 'Registre e gerencie entradas financeiras realizadas.',
    href: '/finance/incomes',
  },
  {
    title: 'Despesas',
    description: 'Gerencie saídas financeiras realizadas por categoria.',
    href: '/finance/expenses',
    disabled: true,
  },
  {
    title: 'Histórico',
    description: 'Consulte receitas e despesas por período.',
    href: '/finance/history',
  },
  {
    title: 'Resumo',
    description: 'Acompanhe indicadores operacionais financeiros.',
    href: '/finance/summary',
    disabled: true,
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
          <Card key={item.href}>
            <div className='space-y-3'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>
                  {item.title}
                </h2>
                <p className='mt-1 text-sm text-slate-600'>
                  {item.description}
                </p>
              </div>

              {item.disabled ? (
                <span className='inline-flex rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500'>
                  Em breve
                </span>
              ) : (
                <Link
                  href={item.href}
                  className='inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700'
                >
                  Acessar
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
