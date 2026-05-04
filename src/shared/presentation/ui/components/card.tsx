import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}
