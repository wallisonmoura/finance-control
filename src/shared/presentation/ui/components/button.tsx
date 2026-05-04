import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export function Button({
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white',
        'transition disabled:cursor-not-allowed disabled:opacity-70',
        'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
