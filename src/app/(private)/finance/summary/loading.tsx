import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

export default function FinanceSummaryLoading() {
  return (
    <RouteLoadingRegion>
      <BackLinkSkeleton />
      <PageTitleSkeleton />
      <FilterBarSkeleton fieldCount={1} />
      <StatCardGridSkeleton count={3} />
      <ListRowsSkeleton count={5} />
    </RouteLoadingRegion>
  );
}
