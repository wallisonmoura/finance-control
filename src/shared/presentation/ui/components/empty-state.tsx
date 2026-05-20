import { Card } from '@/shared/presentation/ui/components/card';

type EmptyStateProps = {
  title?: string;
  description: string;
};

export function EmptyState({
  title = 'Nada encontrado',
  description,
}: EmptyStateProps) {
  return (
    <Card>
      <div className='space-y-1'>
        <p className='text-sm font-medium text-slate-900'>{title}</p>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </Card>
  );
}
