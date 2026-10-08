import type { Metadata } from 'next';

import { getCurrentUserSpendingGoals } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { SpendingGoalsPageContent } from '@/modules/finance/presentation/ui/components/spending-goals-page-content';

export const metadata: Metadata = {
  title: 'Metas',
};

export default async function SpendingGoalsPage() {
  const { data, error } = await getCurrentUserSpendingGoals();

  return <SpendingGoalsPageContent overview={data} error={error} />;
}
