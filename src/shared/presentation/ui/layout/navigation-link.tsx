import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

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
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex min-h-10 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
          : 'text-slate-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      ].join(' ')}
    >
      {Icon ? <Icon aria-hidden='true' className='size-4 shrink-0' /> : null}
      {label}
    </Link>
  );
}
