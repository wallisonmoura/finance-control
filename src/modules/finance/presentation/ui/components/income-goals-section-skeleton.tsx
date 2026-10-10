import { Card } from '@/shared/presentation/ui/components/card';
import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

import { GoalsSectionHeaderSkeleton } from './goals-section-header-skeleton';

const ROWS = [0, 1];

export function IncomeGoalsSectionSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <GoalsSectionHeaderSkeleton />
        <ButtonSkeleton className='w-52' />
      </div>

      <Card className='p-5'>
        <div className='space-y-5'>
          {ROWS.map((row) => (
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
    </div>
  );
}
