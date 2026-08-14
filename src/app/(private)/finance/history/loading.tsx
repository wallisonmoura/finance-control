import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';
import { FinanceHistorySummarySkeleton } from '@/modules/finance/presentation/ui/components/finance-history-summary-skeleton';

export default function FinanceHistoryLoading() {
  return (
    <RouteLoadingRegion>
      <BackLinkSkeleton />
      <PageTitleSkeleton />
      <FilterBarSkeleton fieldCount={4} />
      <FinanceHistorySummarySkeleton />
      <ListRowsSkeleton count={5} />
    </RouteLoadingRegion>
  );
}
