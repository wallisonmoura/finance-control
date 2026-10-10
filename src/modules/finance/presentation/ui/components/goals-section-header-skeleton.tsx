import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function GoalsSectionHeaderSkeleton() {
  return (
    <div>
      <Skeleton className='h-6 w-40' />
      <Skeleton className='mt-2 h-4 w-72 max-w-full' />
    </div>
  );
}
