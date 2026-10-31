import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';

import { GoalRowsSkeleton } from './goal-rows-skeleton';
import { GoalsSectionHeaderSkeleton } from './goals-section-header-skeleton';

export function IncomeGoalsSectionSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <GoalsSectionHeaderSkeleton />
        <ButtonSkeleton className='w-52' />
      </div>

      <GoalRowsSkeleton />
    </div>
  );
}
