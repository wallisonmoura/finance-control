import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

function GoalPartSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className='flex items-center justify-between gap-4'>
        <Skeleton className='h-4 w-full max-w-40' />
        <Skeleton className='h-4 w-16' />
      </div>
      <Skeleton className='mt-3 h-6 w-full max-w-64' />
      <Skeleton className='mt-2 h-4 w-full max-w-56' />
      <Skeleton className='mt-3 h-2 w-full rounded-full' />
    </div>
  );
}

// Same shape as MonthlyIncomeGoalsStrip with both goals: a title and the
// profit and revenue parts side by side (stacked on a phone).
export function MonthlyIncomeGoalsStripSkeleton() {
  return (
    <Card className='space-y-4 p-5'>
      <Skeleton className='h-4 w-40' />
      <div className='grid gap-5 lg:grid-cols-[3fr_2fr]'>
        <GoalPartSkeleton />
        <GoalPartSkeleton className='border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5' />
      </div>
    </Card>
  );
}
