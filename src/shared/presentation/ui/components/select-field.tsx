import type { SelectHTMLAttributes } from 'react';
import { Label } from '@/shared/presentation/ui/primitives/label';

type SelectFieldOption = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  options: SelectFieldOption[];
};

export function SelectField({
  id,
  label,
  name,
  value,
  placeholder = 'Selecione uma opção',
  options,
  className = '',
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-slate-900'>
        {label}
      </Label>

      <select
        id={id}
        name={name}
        value={value}
        className={[
          'h-11 w-full cursor-pointer rounded-lg border border-input bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none',
          'transition-[border-color,box-shadow,background-color,color] duration-300 ease-out',
          'hover:border-slate-400 hover:bg-slate-50',
          'focus:border-slate-500 focus:bg-white focus:shadow-md focus:shadow-slate-200/70 focus:ring-4 focus:ring-slate-300/40',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          className,
        ].join(' ')}
        {...props}
      >
        {children ?? (
          <>
            <option value=''>{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}
