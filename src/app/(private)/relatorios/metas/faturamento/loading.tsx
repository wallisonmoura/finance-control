import { IncomeGoalHistorySkeleton } from '@/modules/reports/presentation/ui/components/income-goal-history-skeleton';
import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';

export default function IncomeGoalHistoryLoading() {
  return (
    <RouteLoadingRegion>
      <IncomeGoalHistorySkeleton />
    </RouteLoadingRegion>
  );
}
