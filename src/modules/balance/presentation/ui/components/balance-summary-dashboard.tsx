'use client';

import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadingState } from '@/shared/presentation/ui/components/loading-state';
import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

import { useBalanceSummary } from '../hooks/use-balance-summary';
import { BalanceSummaryCards } from './balance-summary-cards';

export function BalanceSummaryDashboard() {
  const { data, isLoading, error } = useBalanceSummary();

  if (isLoading) {
    return <LoadingState message='Carregando resumo financeiro...' />;
  }

  if (error) {
    return (
      <StatusMessage
        title='Não foi possível carregar o dashboard.'
        message={error}
        tone='error'
      />
    );
  }

  if (!data) {
    return <EmptyState description='Nenhum resumo financeiro encontrado.' />;
  }

  return <BalanceSummaryCards summary={data} />;
}
