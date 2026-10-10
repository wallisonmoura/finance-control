import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { GoalsPageSkeleton } from '@/modules/finance/presentation/ui/components/goals-page-skeleton';

export default function GoalsLoading() {
  return (
    <RouteLoadingRegion>
      <GoalsPageSkeleton />
    </RouteLoadingRegion>
  );
}
