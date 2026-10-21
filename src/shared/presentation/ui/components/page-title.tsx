import { cn } from '@/shared/presentation/ui/lib/utils';

import { ScreenHelpContent } from '../help/screen-help';
import { HelpPopover, ScreenHelpBody } from './help-popover';

type PageTitleProps = {
  title: string;
  description?: string;
  // Adds a "?" next to the title explaining what the screen is for.
  help?: ScreenHelpContent;
  className?: string;
};

export function PageTitle({ title, description, help, className }: PageTitleProps) {
  return (
    <div className={cn(className)}>
      <div className='flex items-center gap-2'>
        <h1 className='min-w-0 break-words text-2xl font-bold tracking-tight text-foreground'>
          {title}
        </h1>

        {help ? (
          <HelpPopover label={`Ajuda: ${title}`} className='text-muted-foreground'>
            <ScreenHelpBody help={help} />
          </HelpPopover>
        ) : null}
      </div>

      {description && (
        <p className='mt-2 text-sm leading-6 text-muted-foreground'>
          {description}
        </p>
      )}
    </div>
  );
}
