import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';

import { IncomeGoalsSectionSkeleton } from './income-goals-section-skeleton';
import { SpendingGoalsPageSkeleton } from './spending-goals-page-skeleton';

export function GoalsPageSkeleton() {
  return (
    <div className='space-y-10'>
      <PageTitleSkeleton />
      <IncomeGoalsSectionSkeleton />
      <SpendingGoalsPageSkeleton />
    </div>
  );
}
