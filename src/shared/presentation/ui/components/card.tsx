import { HTMLAttributes } from 'react';

import { Card as PrimitiveCard } from '@/shared/presentation/ui/primitives/card';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <PrimitiveCard
      className={[
        'border border-border bg-card p-4 shadow-sm shadow-slate-200/70',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </PrimitiveCard>
  );
}
