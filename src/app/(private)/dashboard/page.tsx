import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { getCurrentUserBalanceSummary } from '@/modules/balance/presentation/server/get-current-user-balance-summary';
import { getCurrentUserFinanceHistory } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { getCurrentMonthFilters } from '@/modules/finance/presentation/ui/utils/finance-filters';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default async function DashboardPage() {
  const [{ data, error }, financeHistory] = await Promise.all([
    getCurrentUserBalanceSummary(),
    getCurrentUserFinanceHistory(getCurrentMonthFilters()),
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
      />
    </main>
  );
}
