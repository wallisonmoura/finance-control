import type { Metadata } from 'next';
import { FinanceOverviewPageContent } from '@/modules/finance/presentation/ui/components/finance-overview-page-content';

export const metadata: Metadata = {
  title: 'Financeiro',
};

export default function FinancePage() {
  return <FinanceOverviewPageContent />;
}
