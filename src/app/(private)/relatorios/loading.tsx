import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';
import { ReportsChartSkeleton } from '@/modules/reports/presentation/ui/components/reports-chart-skeleton';

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

      <div className='grid gap-6 xl:grid-cols-2'>
        <ReportsChartSkeleton />
        <ReportsChartSkeleton />

        <div className='xl:col-span-2'>
          <ReportsChartSkeleton />
        </div>
      </div>
    </RouteLoadingRegion>
  );
}
