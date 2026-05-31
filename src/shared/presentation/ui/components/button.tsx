import { ButtonHTMLAttributes } from 'react';

import { Button as PrimitiveButton } from '@/shared/presentation/ui/primitives/button';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'custom';
};

export function Button({
  asChild = false,
  fullWidth = false,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const primitiveVariant = {
    primary: 'default',
    secondary: 'secondary',
    danger: 'destructive',
    ghost: 'ghost',
    custom: 'ghost',
  }[variant] as 'default' | 'secondary' | 'destructive' | 'ghost';

  const variantClassName = {
    primary:
      'bg-accent text-accent-foreground shadow-sm hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring',
    secondary:
      'bg-card text-foreground ring-1 ring-border shadow-sm hover:bg-muted hover:text-foreground focus-visible:ring-ring',
    danger:
      'bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/15 hover:text-destructive focus-visible:ring-destructive',
    ghost:
      'bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground focus-visible:ring-ring',
    custom: 'shadow-none focus-visible:ring-ring',
  }[variant];

  return (
    <PrimitiveButton
      asChild={asChild}
      variant={primitiveVariant}
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
