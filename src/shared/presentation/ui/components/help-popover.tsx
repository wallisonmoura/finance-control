'use client';

import { CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { KeyboardEvent, ReactNode, useId, useRef, useState } from 'react';

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
  // "hero" sits on the fixed dark hero surface, where the default focus ring
  // is too faint; it gets the brand green instead.
  tone?: 'default' | 'hero';
  className?: string;
};

const TABBABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// A "?" button that opens a short explanation. The Radix popover handles
// Enter/Space and Escape. Tab is handled here: the balloon is portaled to the
// end of the page, so tabbing out of it would throw the keyboard user past the
// whole page. Instead it closes and focus goes back to the "?".
export function HelpPopover({
  label,
  children,
  size = 'md',
  tone = 'default',
  className,
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bodyId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') {
      return;
    }

    const tabbables = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
    );
    const edge = event.shiftKey ? tabbables[0] : tabbables[tabbables.length - 1];
    const leaving =
      tabbables.length === 0 ||
      document.activeElement === edge ||
      document.activeElement === event.currentTarget;

    if (!leaving) {
      return;
    }

    event.preventDefault();
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={triggerRef}
        type='button'
        aria-label={label}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-3',
          tone === 'hero' ? 'focus-visible:ring-hero-accent' : 'focus-visible:ring-ring',
          // sm is the minimum 24×24px target (WCAG 2.5.8).
          size === 'md' ? 'size-7' : 'size-6',
          className,
        )}
      >
        <CircleHelp aria-hidden='true' className={size === 'md' ? 'size-5' : 'size-4'} />
      </PopoverTrigger>

      <PopoverContent
        aria-label={label}
        aria-describedby={bodyId}
        align='start'
        // Keeps the balloon off the screen edges on a phone.
        collisionPadding={16}
        onKeyDown={handleKeyDown}
        className='w-80 max-w-[calc(100vw-2rem)] p-4 text-sm leading-6'
      >
        <div id={bodyId} className='space-y-3'>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ScreenHelpBodyProps = {
  help: ScreenHelpContent;
};

// Section titles are bold text, not headings: the balloon renders at the end
// of the page (portal), so headings would show up out of context in the
// page's heading navigation. The dialog itself is named by the trigger label.
export function ScreenHelpBody({ help }: ScreenHelpBodyProps) {
  return (
    <div className='space-y-3'>
      <section>
        <p className='font-semibold text-foreground'>O que é</p>
        <p className='text-muted-foreground'>{help.whatIs}</p>
      </section>

      <section>
        <p className='font-semibold text-foreground'>O que dá pra fazer aqui</p>
        <ul className='list-disc space-y-1 pl-5 text-muted-foreground'>
          {help.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        {help.note ? <p className='mt-2 font-medium text-foreground'>{help.note}</p> : null}
      </section>

      {help.elsewhere ? (
        <section className='border-t border-border pt-3'>
          <p className='font-semibold text-foreground'>Não é aqui?</p>
          <p className='text-muted-foreground'>{help.elsewhere.text}</p>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
            {help.elsewhere.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='rounded-sm font-semibold text-income hover:underline focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring'
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

// A small "?" next to a hero figure's label (e.g. "Saldo Final") with one sentence.
export function TermHelp({ term, className }: TermHelpProps) {
  const help = TERM_HELP[term];

  return (
    <HelpPopover label={`O que é ${help.term}?`} size='sm' tone='hero' className={className}>
      <p className='font-semibold text-foreground'>{help.term}</p>
      <p className='text-muted-foreground'>{help.text}</p>
    </HelpPopover>
  );
}
