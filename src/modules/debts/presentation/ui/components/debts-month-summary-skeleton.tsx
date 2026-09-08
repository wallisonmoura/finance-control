import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function DebtsMonthSummarySkeleton() {
  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3'
        >
          <Skeleton className='size-9 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-3 w-full max-w-28' />
            <Skeleton className='h-5 w-full max-w-20' />
          </div>
        </div>
      ))}
    </div>
  );
}
