import type { Metadata } from 'next';

import {
  getCurrentUserIncomeGoals,
  getCurrentUserSpendingGoals,
} from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { GoalsPageContent } from '@/modules/finance/presentation/ui/components/goals-page-content';

export const metadata: Metadata = {
  title: 'Metas',
};

export default async function GoalsPage() {
  const [incomeGoals, spendingGoals] = await Promise.all([
    getCurrentUserIncomeGoals(),
    getCurrentUserSpendingGoals(),
  ]);

  return (
    <GoalsPageContent
      incomeGoals={incomeGoals.data}
      incomeGoalsError={incomeGoals.error}
      spendingGoals={spendingGoals.data}
      spendingGoalsError={spendingGoals.error}
    />
  );
}
