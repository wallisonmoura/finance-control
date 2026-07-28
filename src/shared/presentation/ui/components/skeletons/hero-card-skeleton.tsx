import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type HeroCardSkeletonProps = {
  subStatsCount?: number;
};

export function HeroCardSkeleton({
  subStatsCount = 0,
}: HeroCardSkeletonProps) {
  return (
    <Card className='overflow-hidden border-primary/10 bg-primary/5 p-5 sm:p-7'>
      <div className='space-y-5'>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-10 rounded-full' />
          <Skeleton className='h-4 w-32' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>

      {subStatsCount > 0 && (
        <div className='mt-6 flex flex-wrap gap-4 border-t border-border/50 pt-6'>
          {Array.from({ length: subStatsCount }).map((_, index) => (
            <div key={index} className='min-w-24 flex-1 space-y-3'>
              <Skeleton className='size-5 rounded-full' />
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-6 w-24' />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
