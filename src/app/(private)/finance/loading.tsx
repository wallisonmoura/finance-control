import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';

export default function FinanceOverviewLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <StatCardGridSkeleton count={4} />
    </RouteLoadingRegion>
  );
}
