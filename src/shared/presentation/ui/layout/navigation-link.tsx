import Link from 'next/link';

type NavigationLinkProps = {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

export function NavigationLink({
  href,
  label,
  isActive = false,
  onClick,
}: NavigationLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}
