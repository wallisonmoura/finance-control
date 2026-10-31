import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';
import { ReportsOverviewSkeleton } from '@/modules/reports/presentation/ui/components/reports-overview-skeleton';

export default function ReportsLoading() {
  return (
    <RouteLoadingRegion>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <PageTitleSkeleton />

        <div className='w-full max-w-48 space-y-1.5'>
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-11 w-full rounded-lg' />
        </div>
      </div>

      <ReportsOverviewSkeleton />
    </RouteLoadingRegion>
  );
}
