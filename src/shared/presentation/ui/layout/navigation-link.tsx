import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/presentation/ui/lib/utils';

type NavigationLinkProps = {
  href: string;
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
};

export function NavigationLink({
  href,
  label,
  icon: Icon,
  isActive = false,
  onClick,
}: NavigationLinkProps) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring',
        isActive
          ? 'bg-hero text-hero-foreground shadow-lg shadow-hero/15 ring-1 ring-hero-accent/20 [&_svg]:text-hero-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:text-muted-foreground',
      )}
    >
      {Icon ? <Icon aria-hidden='true' className='size-5 shrink-0' /> : null}
      {label}
    </Link>
  );
}
