import type { Metadata } from 'next';
import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { getCurrentUserBalanceSummary } from '@/modules/balance/presentation/server/get-current-user-balance-summary';
import {
  getCurrentUserFinanceHistory,
  getCurrentUserMonthlyInsights,
  getCurrentUserSpendingGoals,
} from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { MonthlyInsightsCard } from '@/modules/finance/presentation/ui/components/monthly-insights-card';
import { SpendingGoalsCard } from '@/modules/finance/presentation/ui/components/spending-goals-card';
import { getCurrentMonthFilters } from '@/modules/finance/presentation/ui/utils/finance-filters';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export const metadata: Metadata = {
  title: 'Página inicial',
};

export default async function HomePage() {
  const [{ data, error }, financeHistory, monthlyInsights, spendingGoals] =
    await Promise.all([
      getCurrentUserBalanceSummary(),
      getCurrentUserFinanceHistory(getCurrentMonthFilters()),
      getCurrentUserMonthlyInsights(),
      getCurrentUserSpendingGoals(),
    ]);

  return (
    <main className='space-y-6'>
      <PageTitle
        title='Página inicial'
        description='Acompanhe sua posição financeira atual.'
      />

      <BalanceSummaryDashboard
        summary={data}
        error={error}
        recentEntries={financeHistory.data?.entries.slice(0, 5) ?? []}
        monthSlot={
          <>
            <MonthlyInsightsCard
              insights={monthlyInsights.data}
              error={monthlyInsights.error}
            />
            <SpendingGoalsCard
              overview={spendingGoals.data}
              error={spendingGoals.error}
            />
          </>
        }
      />
    </main>
  );
}
