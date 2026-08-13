import type { Metadata } from 'next';
import { getCurrentUserFinanceHistory } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { FinanceIncomesPageContent } from '@/modules/finance/presentation/ui/components/finance-incomes-page-content';
import { getCurrentMonthFilters } from '@/modules/finance/presentation/ui/utils/finance-filters';

export const metadata: Metadata = {
  title: 'Receitas',
};

export default async function FinanceIncomesPage() {
  const filters = getCurrentMonthFilters({
    type: 'INCOME',
  });
  const { data, error } = await getCurrentUserFinanceHistory(filters);

  return (
    <FinanceIncomesPageContent
      initialHistory={data}
      initialError={error}
      initialFilters={filters}
    />
  );
}
