import { getCurrentUserIncomeGoals } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { IncomeGoalTargetsUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

// The history pages only need the two targets; a missing goal is null.
export async function getIncomeGoalTargets(): Promise<{
  targets: IncomeGoalTargetsUi;
  error: string | null;
}> {
  const result = await getCurrentUserIncomeGoals();

  return {
    targets: {
      revenueTarget: result.data?.revenue?.target ?? null,
      profitTarget: result.data?.profit?.target ?? null,
    },
    error: result.error ?? null,
  };
}
