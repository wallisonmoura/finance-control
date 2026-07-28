import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function PageTitleSkeleton() {
  return (
    <div>
      <Skeleton className='h-7 w-48' />
      <Skeleton className='mt-2 h-4 w-72' />
    </div>
  );
}
