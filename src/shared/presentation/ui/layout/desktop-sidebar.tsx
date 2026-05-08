import { isNavigationItemActive } from './is-navigation-item-active';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { NavigationLink } from './navigation-link';

type DesktopSidebarProps = {
  pathname: string;
};

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  return (
    <aside className='hidden min-h-screen w-64 border-r border-slate-200 bg-white px-4 py-6 md:block'>
      <div className='mb-8'>
        <p className='text-lg font-bold text-slate-900'>Finance Control</p>
        <p className='text-xs text-slate-500'>Controle financeiro</p>
      </div>

      <nav aria-label='Navegação principal' className='space-y-1'>
        {PRIVATE_NAVIGATION_ITEMS.map((item) => (
          <NavigationLink
            key={item.href}
            href={item.href}
            label={item.label}
            isActive={isNavigationItemActive(pathname, item.href)}
          />
        ))}
      </nav>
    </aside>
  );
}
