import type { ReactNode } from 'react';

import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

import { BalanceSummaryUi } from '../types/balance-ui.types';
import { BalanceSummaryCards } from './balance-summary-cards';

type BalanceSummaryDashboardProps = {
  summary?: BalanceSummaryUi | null;
  error?: string | null;
  insightsSlot?: ReactNode;
  goalsSlot?: ReactNode;
  recentEntriesSlot?: ReactNode;
};

export function BalanceSummaryDashboard({
  summary,
  error,
  insightsSlot,
  goalsSlot,
  recentEntriesSlot,
}: BalanceSummaryDashboardProps) {
  if (error) {
    return (
      <StatusMessage
        title='Não foi possível carregar o dashboard.'
        message={error}
        tone='error'
      />
    );
  }

  if (!summary) {
    return <EmptyState description='Nenhum resumo financeiro encontrado.' />;
  }

  return (
    <BalanceSummaryCards
      summary={summary}
      insightsSlot={insightsSlot}
      goalsSlot={goalsSlot}
      recentEntriesSlot={recentEntriesSlot}
    />
  );
}
