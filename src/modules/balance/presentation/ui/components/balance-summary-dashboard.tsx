'use client';

import { Card } from '@/shared/presentation/ui/components/card';
import { useBalanceSummary } from '../hooks/use-balance-summary';
import { BalanceSummaryCards } from './balance-summary-cards';

export function BalanceSummaryDashboard() {
  const { data, isLoading, error } = useBalanceSummary();

  if (isLoading) {
    return (
      <Card>
        <p className='text-sm text-zinc-500'>Carregando resumo financeiro...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className='space-y-2'>
          <p className='font-medium text-red-600'>
            Não foi possível carregar o dashboard.
          </p>

          <p className='text-sm text-zinc-500'>{error}</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <p className='text-sm text-zinc-500'>
          Nenhum resumo financeiro encontrado.
        </p>
      </Card>
    );
  }

  return <BalanceSummaryCards summary={data} />;
}
