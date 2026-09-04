import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';
import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';
import { DebtsMonthSummarySkeleton } from '@/modules/debts/presentation/ui/components/debts-month-summary-skeleton';

export default function DebtsLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <HeroCardSkeleton subStatsCount={3} />
      <FilterBarSkeleton fieldCount={1} />
      <DebtsMonthSummarySkeleton />
      <ListRowsSkeleton count={5} />
    </RouteLoadingRegion>
  );
}
