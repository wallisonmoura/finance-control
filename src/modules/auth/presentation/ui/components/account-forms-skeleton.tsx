import { Card } from '@/shared/presentation/ui/components/card';
import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

function AccountFieldSkeleton({ labelWidth }: { labelWidth: string }) {
  return (
    <div className='space-y-1.5'>
      <Skeleton className={`h-4 ${labelWidth}`} />
      <Skeleton className='h-11 w-full rounded-lg' />
    </div>
  );
}

export function AccountFormsSkeleton() {
  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <Card className='space-y-5 p-5 sm:p-6'>
        <div className='space-y-1'>
          <Skeleton className='h-5 w-36' />
          <Skeleton className='h-4 w-56' />
        </div>

        <AccountFieldSkeleton labelWidth='w-12' />
        <AccountFieldSkeleton labelWidth='w-14' />

        <ButtonSkeleton className='h-11 w-32' />
      </Card>

      <Card className='space-y-5 p-5 sm:p-6'>
        <div className='space-y-1'>
          <Skeleton className='h-5 w-28' />
          <Skeleton className='h-4 w-64' />
        </div>

        <AccountFieldSkeleton labelWidth='w-24' />
        <AccountFieldSkeleton labelWidth='w-24' />
        <AccountFieldSkeleton labelWidth='w-36' />

        <ButtonSkeleton className='h-11 w-40' />
      </Card>
    </div>
  );
}
