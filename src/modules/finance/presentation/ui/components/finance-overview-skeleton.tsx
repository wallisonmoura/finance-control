import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function FinanceOverviewSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='flex min-h-44 flex-col p-4'>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex items-start gap-3'>
              <Skeleton className='size-10 shrink-0 rounded-lg' />

              <div className='min-w-0 flex-1 space-y-2'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-2/3' />
              </div>
            </div>

            <div className='mt-auto'>
              <Skeleton className='h-9 w-28' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
