import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/shared/presentation/ui/lib/utils';

type BackLinkProps = {
  href: string;
  children: string;
  className?: string;
};

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
        className,
      )}
    >
      <ArrowLeft aria-hidden='true' className='size-4' />
      {children}
    </Link>
  );
}
