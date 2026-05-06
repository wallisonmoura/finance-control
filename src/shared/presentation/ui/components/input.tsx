import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({
  label,
  id,
  name,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div>
      <label htmlFor={inputId} className='text-sm font-medium text-slate-900'>
        {label}
      </label>

      <input
        id={inputId}
        name={name}
        className={[
          'mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm',
          'outline-none transition placeholder:text-slate-400 text-black',
          'focus:border-slate-900 focus:ring-1 focus-slate-900',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
