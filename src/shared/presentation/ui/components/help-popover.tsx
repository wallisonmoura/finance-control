'use client';

import { CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { cn } from '@/shared/presentation/ui/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/ui/primitives/popover';

import { ScreenHelpContent, TERM_HELP, TermHelpKey } from '../help/screen-help';

type HelpPopoverProps = {
  // The button's accessible name, e.g. "Ajuda: Despesas".
  label: string;
  children: ReactNode;
  // "sm" sits next to a figure label; "md" next to a page title.
  size?: 'sm' | 'md';
  className?: string;
};

// A "?" button that opens a short explanation. The Radix popover already
// handles the keyboard: Enter/Space opens, Escape closes and returns focus.
export function HelpPopover({ label, children, size = 'md', className }: HelpPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        type='button'
        aria-label={label}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50',
          size === 'md' ? 'size-7' : 'size-5',
          className,
        )}
      >
        <CircleHelp aria-hidden='true' className={size === 'md' ? 'size-5' : 'size-4'} />
      </PopoverTrigger>

      <PopoverContent
        aria-label={label}
        align='start'
        // Keeps the balloon off the screen edges on a phone.
        collisionPadding={16}
        className='w-80 max-w-[calc(100vw-2rem)] space-y-3 p-4 text-sm leading-6'
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

type ScreenHelpBodyProps = {
  help: ScreenHelpContent;
};

export function ScreenHelpBody({ help }: ScreenHelpBodyProps) {
  return (
    <div className='space-y-3'>
      <section>
        <h2 className='font-semibold text-foreground'>O que é</h2>
        <p className='text-muted-foreground'>{help.whatIs}</p>
      </section>

      <section>
        <h2 className='font-semibold text-foreground'>O que dá pra fazer aqui</h2>
        <ul className='list-disc space-y-1 pl-5 text-muted-foreground'>
          {help.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      {help.elsewhere ? (
        <section className='border-t border-border pt-3'>
          <h2 className='font-semibold text-foreground'>Não é aqui?</h2>
          <p className='text-muted-foreground'>{help.elsewhere.text}</p>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
            {help.elsewhere.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='rounded-sm font-semibold text-income hover:underline focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50'
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type TermHelpProps = {
  term: TermHelpKey;
  className?: string;
};

// A small "?" next to a figure's label (e.g. "Saldo Final") with one sentence.
export function TermHelp({ term, className }: TermHelpProps) {
  const help = TERM_HELP[term];

  return (
    <HelpPopover label={`O que é ${help.term}?`} size='sm' className={className}>
      <p className='font-semibold text-foreground'>{help.term}</p>
      <p className='text-muted-foreground'>{help.text}</p>
    </HelpPopover>
  );
}
