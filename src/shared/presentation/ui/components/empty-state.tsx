import { Card } from '@/shared/presentation/ui/components/card';

type EmptyStateProps = {
  title?: string;
  description: string;
  className?: string;
};

export function EmptyState({
  title = 'Nada encontrado',
  description,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <div className='space-y-1'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </Card>
  );
}
