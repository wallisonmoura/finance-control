import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = 'Carregando...',
}: LoadingStateProps) {
  return (
    <Card>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-3 w-64 max-w-full' />
        <p className='text-sm text-muted-foreground'>{message}</p>
      </div>
    </Card>
  );
}
