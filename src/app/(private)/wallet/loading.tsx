import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';
import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';

export default function WalletLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <HeroCardSkeleton subStatsCount={0} />
      <StatCardGridSkeleton count={3} />
      <ButtonSkeleton className='w-full sm:w-48' />
    </RouteLoadingRegion>
  );
}
