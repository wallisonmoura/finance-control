import { Card } from '@/shared/presentation/ui/components/card';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = 'Carregando...',
}: LoadingStateProps) {
  return (
    <Card>
      <div role='status' aria-live='polite'>
        <p className='text-sm text-muted-foreground'>{message}</p>
      </div>
    </Card>
  );
}
