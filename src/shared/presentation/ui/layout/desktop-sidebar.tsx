import { isNavigationItemActive } from './is-navigation-item-active';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { NavigationLink } from './navigation-link';

type DesktopSidebarProps = {
  pathname: string;
};

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  return (
    <aside className='sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200/80 bg-white px-4 py-6 md:block'>
      <div className='mb-8 border-b border-slate-100 pb-5'>
        <p className='text-lg font-bold tracking-tight text-slate-950'>
          Finance Control
        </p>
        <p className='text-xs text-slate-500'>Controle financeiro</p>
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
