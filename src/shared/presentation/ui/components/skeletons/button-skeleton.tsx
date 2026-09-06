import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';
import { cn } from '@/shared/presentation/ui/lib/utils';

type ButtonSkeletonProps = {
  className?: string;
};

export function ButtonSkeleton({ className }: ButtonSkeletonProps) {
  return <Skeleton className={cn('h-12 w-40 rounded-lg', className)} />;
}
