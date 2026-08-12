import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

import { BalanceSummaryUi } from '../types/balance-ui.types';
import { BalanceSummaryCards } from './balance-summary-cards';
import { FinanceEntryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

type BalanceSummaryDashboardProps = {
  summary?: BalanceSummaryUi | null;
  error?: string | null;
  recentEntries?: FinanceEntryUi[];
};

export function BalanceSummaryDashboard({
  summary,
  error,
  recentEntries = [],
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

  return <BalanceSummaryCards summary={summary} recentEntries={recentEntries} />;
}
