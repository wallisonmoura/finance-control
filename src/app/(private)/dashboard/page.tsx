import { BalanceSummaryDashboard } from '@/modules/balance/presentation/ui/components/balance-summary-dashboard';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default function DashboardPage() {
  return (
    <main className='space-y-6'>
      <PageTitle
        title='Dashboard'
        description='Acompanhe sua posição financeira atual.'
      />

      <BalanceSummaryDashboard />
    </main>
  );
}
