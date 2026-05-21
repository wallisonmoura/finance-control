import type {
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from 'react';

import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input as PrimitiveInput } from '@/shared/presentation/ui/primitives/input';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const decimalInputKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

function isAllowedDecimalValue(value: string) {
  return /^-?\d*(,\d{0,2})?$/.test(value);
}

function getNextInputValue(
  currentValue: string,
  insertedValue: string,
  selectionStart: number | null,
  selectionEnd: number | null,
) {
  const start = selectionStart ?? currentValue.length;
  const end = selectionEnd ?? currentValue.length;

  return `${currentValue.slice(0, start)}${insertedValue}${currentValue.slice(
    end,
  )}`;
}

function shouldBlockDecimalKey(event: KeyboardEvent<HTMLInputElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  if (decimalInputKeys.has(event.key)) {
    return false;
  }

  if (event.key.length !== 1) {
    return false;
  }

  if (!/^[0-9,-]$/.test(event.key)) {
    return true;
  }

  return !isAllowedDecimalValue(
    getNextInputValue(
      event.currentTarget.value,
      event.key,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
    ),
  );
}

function shouldBlockDecimalPaste(event: ClipboardEvent<HTMLInputElement>) {
  const pastedValue = event.clipboardData.getData('text');

  if (/[^0-9,-]/.test(pastedValue)) {
    return true;
  }

  return !isAllowedDecimalValue(
    getNextInputValue(
      event.currentTarget.value,
      pastedValue,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
    ),
  );
}

export function Input({
  label,
  id,
  name,
  className = '',
  inputMode,
  onKeyDown,
  onPaste,
  ...props
}: InputProps) {
  const inputId = id ?? name;
  const isDecimalInput = inputMode === 'decimal';

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);

    if (!event.defaultPrevented && isDecimalInput && shouldBlockDecimalKey(event)) {
      event.preventDefault();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    onPaste?.(event);

    if (
      !event.defaultPrevented &&
      isDecimalInput &&
      shouldBlockDecimalPaste(event)
    ) {
      event.preventDefault();
    }
  }

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={inputId} className='text-slate-900'>
        {label}
      </Label>

      <PrimitiveInput
        id={inputId}
        name={name}
        inputMode={inputMode}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={[
          'h-11 bg-white text-black transition-all duration-200 ease-out',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
