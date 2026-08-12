import { ReactNode } from 'react';

import { Card } from '@/shared/presentation/ui/components/card';
import { cn } from '@/shared/presentation/ui/lib/utils';

type HeroCardProps = {
  backgroundClassName: string;
  overlayClassName: string;
  contentClassName?: string;
  children: ReactNode;
};

export function HeroCard({
  backgroundClassName,
  overlayClassName,
  contentClassName,
  children,
}: HeroCardProps) {
  return (
    <Card className='relative overflow-hidden border-primary/10 bg-primary p-0 text-primary-foreground shadow-xl shadow-border/80'>
      <div
        aria-hidden='true'
        className={cn('absolute inset-0 bg-cover bg-center', backgroundClassName)}
      />
      <div
        aria-hidden='true'
        className={cn('absolute inset-0', overlayClassName)}
      />

      <div
        className={cn('relative grid gap-6 p-5 sm:p-7', contentClassName)}
      >
        {children}
      </div>
    </Card>
  );
}
