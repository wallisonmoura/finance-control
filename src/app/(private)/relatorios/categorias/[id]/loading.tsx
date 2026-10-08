import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { CategoryHistorySkeleton } from '@/modules/reports/presentation/ui/components/category-history-skeleton';

export default function CategoryHistoryLoading() {
  return (
    <RouteLoadingRegion>
      <CategoryHistorySkeleton />
    </RouteLoadingRegion>
  );
}
