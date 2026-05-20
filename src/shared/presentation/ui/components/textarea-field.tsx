import type { TextareaHTMLAttributes } from 'react';

import { Label } from '@/shared/presentation/ui/primitives/label';
import { Textarea } from '@/shared/presentation/ui/primitives/textarea';

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextareaField({
  label,
  id,
  name,
  className = '',
  ...props
}: TextareaFieldProps) {
  const inputId = id ?? name;

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={inputId} className='text-slate-900'>
        {label}
      </Label>

      <Textarea
        id={inputId}
        name={name}
        className={[
          'min-h-24 bg-white text-black transition-all duration-200 ease-out',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
