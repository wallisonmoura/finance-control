import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';
import { FinanceSummaryCardsSkeleton } from '@/modules/finance/presentation/ui/components/finance-summary-cards-skeleton';
import { FinanceSummaryTableSkeleton } from '@/modules/finance/presentation/ui/components/finance-summary-table-skeleton';

export default function FinanceSummaryLoading() {
  return (
    <RouteLoadingRegion>
      <BackLinkSkeleton />
      <PageTitleSkeleton />
      <FilterBarSkeleton fieldCount={1} />
      <FinanceSummaryCardsSkeleton />
      <FinanceSummaryTableSkeleton rowCount={5} />
    </RouteLoadingRegion>
  );
}
