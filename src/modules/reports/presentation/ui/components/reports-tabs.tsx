'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/presentation/ui/lib/utils';

const REPORTS_TABS = [
  { label: 'Visão geral', href: '/relatorios' },
  { label: 'Metas', href: '/relatorios/metas' },
];

// "/relatorios" must not stay current on "/relatorios/metas", but the
// category history is a detail of the overview, so it keeps it current.
function isTabCurrent(href: string, pathname: string): boolean {
  if (href === '/relatorios') {
    return pathname === href || pathname.startsWith('/relatorios/categorias/');
  }

  return pathname === href;
}

export function ReportsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label='Seções de relatórios'
      className='inline-flex rounded-lg border border-border bg-card p-1 shadow-sm'
    >
      {REPORTS_TABS.map((tab) => {
        const isCurrent = isTabCurrent(tab.href, pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
              isCurrent
                ? 'bg-hero text-hero-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
