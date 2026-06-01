import { cn } from '@/shared/presentation/ui/lib/utils';

type PageTitleProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <div className={cn(className)}>
      <h1 className='text-2xl font-bold tracking-tight text-foreground'>
        {title}
      </h1>

      {description && (
        <p className='mt-2 text-sm leading-6 text-muted-foreground'>
          {description}
        </p>
      )}
    </div>
  );
}
