import { ButtonHTMLAttributes } from 'react';

import { Button as PrimitiveButton } from '@/shared/presentation/ui/primitives/button';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({
  asChild = false,
  fullWidth = false,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClassName = {
    primary:
      '!bg-[var(--fc-secondary)] !text-slate-950 shadow-sm hover:!bg-emerald-600 hover:!text-white focus-visible:ring-[var(--fc-secondary)]',
    secondary:
      '!bg-white !text-slate-700 ring-1 ring-border shadow-sm hover:!bg-muted hover:!text-slate-950 focus-visible:ring-[var(--fc-secondary)]',
    danger:
      '!bg-red-50 !text-red-700 ring-1 ring-red-200 hover:!bg-red-100 hover:!text-red-800 focus-visible:ring-[var(--fc-danger)]',
    ghost:
      '!bg-transparent !text-muted-foreground shadow-none hover:!bg-muted hover:!text-foreground focus-visible:ring-[var(--fc-secondary)]',
  }[variant];

  return (
    <PrimitiveButton
      asChild={asChild}
      size='lg'
      className={[
        variantClassName,
        'disabled:bg-muted disabled:text-muted-foreground disabled:ring-border',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </PrimitiveButton>
  );
}
