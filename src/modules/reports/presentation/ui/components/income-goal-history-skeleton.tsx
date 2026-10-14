import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

import { ReportsHistoryBodySkeleton } from './reports-history-body-skeleton';

export function IncomeGoalHistorySkeleton() {
  return (
    <div className='space-y-6'>
      <BackLinkSkeleton />

      <div className='flex flex-wrap items-end justify-between gap-4'>
        <PageTitleSkeleton />

        <div className='w-full max-w-48 space-y-1.5'>
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-11 w-full rounded-lg' />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Skeleton className='h-5 w-56' />
        <Skeleton className='h-9 w-28 rounded-lg' />
      </div>

      <ReportsHistoryBodySkeleton />
    </div>
  );
}
