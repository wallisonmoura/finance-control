import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

export default function DashboardLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <HeroCardSkeleton subStatsCount={2} />
      <StatCardGridSkeleton count={3} />
      <ListRowsSkeleton count={5} />
    </RouteLoadingRegion>
  );
}
