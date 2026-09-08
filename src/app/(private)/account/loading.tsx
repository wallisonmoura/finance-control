import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { AccountFormsSkeleton } from '@/modules/auth/presentation/ui/components/account-forms-skeleton';

export default function AccountLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <AccountFormsSkeleton />
    </RouteLoadingRegion>
  );
}
