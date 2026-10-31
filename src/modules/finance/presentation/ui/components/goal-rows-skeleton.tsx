import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

// The card with goal rows (dot + 3 lines), as each goals list shows them:
// used on the first load and while the page refreshes after a save.
export function GoalRowsSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <Card className='p-5'>
      <div className='space-y-5'>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className='flex gap-3'>
            <Skeleton className='mt-1.5 size-2 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-1.5'>
              <Skeleton className='h-4 w-full max-w-28' />
              <Skeleton className='h-4 w-full max-w-56' />
              <Skeleton className='h-4 w-full max-w-80' />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
