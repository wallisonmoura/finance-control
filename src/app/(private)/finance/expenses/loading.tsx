import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';
import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';

export default function FinanceExpensesLoading() {
  return (
    <RouteLoadingRegion>
      <BackLinkSkeleton />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitleSkeleton />
        <ButtonSkeleton className='w-full sm:w-36' />
      </div>

      <ListRowsSkeleton count={4} />
    </RouteLoadingRegion>
  );
}
