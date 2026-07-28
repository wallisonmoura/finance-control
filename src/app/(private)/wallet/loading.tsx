import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';

export default function WalletLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <HeroCardSkeleton subStatsCount={0} />
      <StatCardGridSkeleton count={3} />
    </RouteLoadingRegion>
  );
}
