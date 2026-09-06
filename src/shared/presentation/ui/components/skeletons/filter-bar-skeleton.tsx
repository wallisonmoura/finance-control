import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type FilterBarSkeletonProps = {
  fieldCount?: number;
};

export function FilterBarSkeleton({
  fieldCount = 3,
}: FilterBarSkeletonProps) {
  return (
    <Card className='flex flex-row flex-wrap gap-3'>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <Skeleton key={index} className='h-10 w-full sm:w-40' />
      ))}
    </Card>
  );
}
