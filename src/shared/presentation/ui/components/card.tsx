import { HTMLAttributes } from 'react';

import { Card as PrimitiveCard } from '@/shared/presentation/ui/primitives/card';
import { cn } from '@/shared/presentation/ui/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <PrimitiveCard
      className={cn(
        'border border-border bg-card p-4 shadow-sm shadow-border/60',
        className,
      )}
      {...props}
    >
      {children}
    </PrimitiveCard>
  );
}
