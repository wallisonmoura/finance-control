import { isNavigationItemActive } from './is-navigation-item-active';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { NavigationLink } from './navigation-link';

type DesktopSidebarProps = {
  pathname: string;
};

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  return (
    <aside className='sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground md:block'>
      <div className='mb-6 border-b border-sidebar-border pb-5'>
        <div className='flex items-center gap-3'>
          <div
            aria-hidden='true'
            className='flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm'
          >
            FC
          </div>

          <div className='min-w-0'>
            <p className='truncate text-lg font-bold tracking-tight text-sidebar-foreground'>
              Finance Control
            </p>
            <p className='text-xs text-slate-300'>Controle financeiro</p>
          </div>
        </div>
      </div>

      <nav aria-label='Navegação principal' className='space-y-1'>
        {PRIVATE_NAVIGATION_ITEMS.map((item) => (
          <NavigationLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isNavigationItemActive(pathname, item.href)}
          />
        ))}
      </nav>
    </aside>
  );
}
