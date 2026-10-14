import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

const SUMMARY_ITEMS = [0, 1, 2];

// The body of a history page (chart card + summary). Shown alone while a new
// period loads, so the header and the period select keep keyboard focus.
export function ReportsHistoryBodySkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='mt-4 h-72 w-full' />
      </Card>

      <div className='grid gap-4 sm:grid-cols-3'>
        {SUMMARY_ITEMS.map((item) => (
          <Skeleton key={item} className='h-16 w-full rounded-lg' />
        ))}
      </div>
    </div>
  );
}
