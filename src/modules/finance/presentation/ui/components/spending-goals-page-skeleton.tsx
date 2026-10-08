import { Card } from '@/shared/presentation/ui/components/card';
import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

const ROWS = [0, 1, 2];

export function SpendingGoalsPageSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <PageTitleSkeleton />
        <ButtonSkeleton className='w-36' />
      </div>

      <Card className='p-5'>
        <div className='space-y-5'>
          {ROWS.map((row) => (
            <div key={row} className='flex gap-3'>
              <Skeleton className='mt-1.5 size-2 shrink-0 rounded-full' />
              <div className='min-w-0 flex-1 space-y-1.5'>
                <Skeleton className='h-4 w-full max-w-32' />
                <Skeleton className='h-4 w-full max-w-48' />
                <Skeleton className='h-4 w-full max-w-64' />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
