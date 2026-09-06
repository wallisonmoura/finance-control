import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function PaidDebtsSummarySkeleton() {
  return (
    <Card className='p-0'>
      <div className='grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='flex items-center gap-4 p-5'>
            <Skeleton className='size-12 shrink-0 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-6 w-24' />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
