import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { FinanceOverviewSkeleton } from '@/modules/finance/presentation/ui/components/finance-overview-skeleton';

export default function FinanceOverviewLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <FinanceOverviewSkeleton />
    </RouteLoadingRegion>
  );
}
