import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function FinanceHistorySummarySkeleton() {
  return (
    <Card className='p-0'>
      <div className='grid gap-0 lg:grid-cols-2 xl:grid-cols-4'>
        <div className='flex items-center gap-4 p-5'>
          <Skeleton className='size-14 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 lg:border-t-0 lg:border-l xl:border-l'>
          <Skeleton className='size-14 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 xl:border-t-0 xl:border-l'>
          <Skeleton className='size-14 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>

        <div className='flex items-center gap-4 border-t border-border p-5 lg:border-l xl:border-t-0'>
          <Skeleton className='size-14 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>
      </div>
    </Card>
  );
}
