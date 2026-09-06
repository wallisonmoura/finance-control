import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';
import { cn } from '@/shared/presentation/ui/lib/utils';

type HeroCardSkeletonProps = {
  subStatsCount?: number;
};

export function HeroCardSkeleton({
  subStatsCount = 0,
}: HeroCardSkeletonProps) {
  return (
    <Card className='overflow-hidden border-hero/10 bg-hero p-0'>
      <div
        className={cn(
          'grid gap-6 p-5 sm:p-7',
          subStatsCount > 0 && 'lg:grid-cols-[1fr_auto] lg:items-center',
        )}
      >
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
          <div
            className={cn(
              'grid gap-3 sm:grid-cols-2',
              subStatsCount >= 3 && 'xl:grid-cols-3',
            )}
          >
            {Array.from({ length: subStatsCount }).map((_, index) => (
              <div
                key={index}
                className='space-y-3 rounded-lg border border-hero-foreground/15 bg-hero-foreground/5 p-4'
              >
                <Skeleton className='size-5 rounded-full' />
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-6 w-24' />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
