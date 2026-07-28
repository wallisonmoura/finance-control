import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type ListRowsSkeletonProps = {
  count?: number;
};

export function ListRowsSkeleton({ count = 4 }: ListRowsSkeletonProps) {
  return (
    <Card className='divide-y divide-border p-0'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='flex items-center justify-between gap-3 p-4'
        >
          <div className='flex min-w-0 items-center gap-3'>
            <Skeleton className='size-10 shrink-0 rounded-full' />
            <div className='min-w-0 space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-20' />
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-3'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-14 rounded-full' />
          </div>
        </div>
      ))}
    </Card>
  );
}
