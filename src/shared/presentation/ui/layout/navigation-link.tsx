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
        'relative flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--fc-secondary)]',
        isActive
          ? 'bg-primary text-white shadow-lg shadow-slate-950/15 ring-1 ring-emerald-400/20 [&_svg]:text-[var(--fc-secondary)]'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 [&_svg]:text-slate-700',
      ].join(' ')}
    >
      {Icon ? <Icon aria-hidden='true' className='size-5 shrink-0' /> : null}
      {label}
    </Link>
  );
}
