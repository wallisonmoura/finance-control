import type { Metadata } from 'next';
import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { getCurrentUserBalanceSummary } from '@/modules/balance/presentation/server/get-current-user-balance-summary';
import {
  getCurrentUserFinanceHistory,
  getCurrentUserIncomeGoals,
  getCurrentUserMonthlyInsights,
} from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { MonthlyInsightsCard } from '@/modules/finance/presentation/ui/components/monthly-insights-card';
import { MonthlyIncomeGoalsStrip } from '@/modules/finance/presentation/ui/components/monthly-income-goals-strip';
import { getCurrentMonthFilters } from '@/modules/finance/presentation/ui/utils/finance-filters';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { SCREEN_HELP } from '@/shared/presentation/ui/help/screen-help';

export const metadata: Metadata = {
  title: 'Página inicial',
};

export default async function HomePage() {
  const [{ data, error }, financeHistory, monthlyInsights, incomeGoals] = await Promise.all([
    getCurrentUserBalanceSummary(),
    getCurrentUserFinanceHistory(getCurrentMonthFilters()),
    getCurrentUserMonthlyInsights(),
    getCurrentUserIncomeGoals(),
  ]);

  return (
    <main className='space-y-6'>
      <PageTitle
        title='Página inicial'
        help={SCREEN_HELP.dashboard}
        description='Acompanhe sua posição financeira atual.'
      />

      <BalanceSummaryDashboard
        summary={data}
        error={error}
        recentEntries={financeHistory.data?.entries.slice(0, 5) ?? []}
        goalsSlot={
          <MonthlyIncomeGoalsStrip overview={incomeGoals.data} error={incomeGoals.error} />
        }
        insightsSlot={
          <MonthlyInsightsCard
            insights={monthlyInsights.data}
            error={monthlyInsights.error}
            hideMonthResult={Boolean(incomeGoals.data?.profit)}
          />
        }
      />
    </main>
  );
}
