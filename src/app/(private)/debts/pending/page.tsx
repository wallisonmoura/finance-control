import type { Metadata } from 'next';
import { getCurrentUserPendingDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { PendingDebtsPageContent } from '@/modules/debts/presentation/ui/components/pending-debts-page-content';
import { getCurrentUserExpenseCategories } from '@/modules/finance/presentation/server/get-current-user-finance-data';

export const metadata: Metadata = {
  title: 'Dívidas pendentes',
};

export default async function PendingDebtsPage() {
  const [{ data, error }, categories] = await Promise.all([
    getCurrentUserPendingDebts(),
    getCurrentUserExpenseCategories(),
  ]);

  return (
    <PendingDebtsPageContent
      initialDebts={data}
      initialError={error}
      categories={categories.data}
      categoriesError={categories.error}
    />
  );
}
