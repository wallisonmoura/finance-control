import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { SpendingGoalsPageSkeleton } from '@/modules/finance/presentation/ui/components/spending-goals-page-skeleton';

export default function SpendingGoalsLoading() {
  return (
    <RouteLoadingRegion>
      <SpendingGoalsPageSkeleton />
    </RouteLoadingRegion>
  );
}
