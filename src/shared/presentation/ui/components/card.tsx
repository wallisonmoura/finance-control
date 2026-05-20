import { HTMLAttributes } from 'react';

import { Card as PrimitiveCard } from '@/shared/presentation/ui/primitives/card';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <PrimitiveCard
      className={[
        'border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </PrimitiveCard>
  );
}
