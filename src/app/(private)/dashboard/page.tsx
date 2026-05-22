import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { getCurrentUserBalanceSummary } from '@/modules/balance/presentation/server/get-current-user-balance-summary';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default async function DashboardPage() {
  const { data, error } = await getCurrentUserBalanceSummary();

  return (
    <main className='space-y-6'>
      <PageTitle
        title='Dashboard'
        description='Acompanhe sua posição financeira atual.'
      />

      <BalanceSummaryDashboard summary={data} error={error} />
    </main>
  );
}
