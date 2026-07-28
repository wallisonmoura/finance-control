import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type StatCardGridSkeletonProps = {
  count?: number;
};

export function StatCardGridSkeleton({
  count = 3,
}: StatCardGridSkeletonProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className='space-y-4 p-5'>
          <Skeleton className='size-12 rounded-full' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-3 w-full' />
        </Card>
      ))}
    </div>
  );
}
