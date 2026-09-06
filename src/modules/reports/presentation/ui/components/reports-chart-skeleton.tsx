import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

export function ReportsChartSkeleton() {
  return (
    <Card>
      <Skeleton className='h-5 w-48' />
      <Skeleton className='mt-4 h-72 w-full' />
    </Card>
  );
}
