import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function FinanceSummaryCardsSkeleton() {
  return (
    <section className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
      <Card className='p-5'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-14 shrink-0 rounded-2xl' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-28' />
          </div>
        </div>
      </Card>

      <Card className='p-5'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-14 shrink-0 rounded-2xl' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-28' />
          </div>
        </div>
      </Card>

      <Card className='p-5 lg:col-span-2 xl:col-span-1'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-14 shrink-0 rounded-2xl' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-6 w-28' />
          </div>
        </div>
      </Card>
    </section>
  );
}
