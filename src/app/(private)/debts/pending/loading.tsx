import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

export default function PendingDebtsLoading() {
  return (
    <RouteLoadingRegion>
      <BackLinkSkeleton />
      <PageTitleSkeleton />
      <ListRowsSkeleton count={4} />
    </RouteLoadingRegion>
  );
}
