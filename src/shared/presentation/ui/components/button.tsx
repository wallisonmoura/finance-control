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
      '!bg-slate-900 !text-white shadow-sm hover:!bg-slate-800 focus-visible:ring-slate-400',
    secondary:
      '!bg-white !text-slate-700 ring-1 ring-slate-200 shadow-sm hover:!bg-slate-100 hover:!text-slate-950 focus-visible:ring-slate-300',
    danger:
      '!bg-red-50 !text-red-700 ring-1 ring-red-200 hover:!bg-red-100 hover:!text-red-800 focus-visible:ring-red-300',
    ghost:
      '!bg-transparent !text-slate-600 shadow-none hover:!bg-slate-100 hover:!text-slate-950 focus-visible:ring-slate-300',
  }[variant];

  return (
    <PrimitiveButton
      asChild={asChild}
      size='lg'
      className={[
        variantClassName,
        'disabled:bg-slate-200 disabled:text-slate-500 disabled:ring-slate-200',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </PrimitiveButton>
  );
}
