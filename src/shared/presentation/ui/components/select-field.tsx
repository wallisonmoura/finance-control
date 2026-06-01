import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { cn } from '@/shared/presentation/ui/lib/utils';

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
      <Label htmlFor={id} className='text-foreground'>
        {label}
      </Label>

      <div className='relative'>
        <select
          id={id}
          name={name}
          value={value}
          className={cn(
            'h-11 w-full cursor-pointer appearance-none rounded-lg border border-input bg-card py-2 pr-10 pl-3 text-sm text-foreground shadow-sm outline-none',
            'transition-[border-color,box-shadow,background-color,color] duration-300 ease-out',
            'hover:border-ring hover:bg-muted',
            'focus:border-ring focus:bg-card focus:shadow-md focus:shadow-border/70 focus:ring-4 focus:ring-ring/30',
            'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
            className,
          )}
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

        <ChevronDown
          aria-hidden='true'
          className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground'
        />
      </div>
    </div>
  );
}
