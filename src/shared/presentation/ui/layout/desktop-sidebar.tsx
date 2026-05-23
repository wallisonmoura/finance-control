import Image from 'next/image';

import { isNavigationItemActive } from './is-navigation-item-active';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { NavigationLink } from './navigation-link';

type DesktopSidebarProps = {
  pathname: string;
};

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  return (
    <aside className='sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white px-4 py-4 text-slate-800 shadow-xl shadow-slate-200/70 md:block'>
      <div className='mb-7 border-b border-slate-200 pb-4'>
        <div className='relative h-16 w-full overflow-hidden'>
          <Image
            src='/images/logo-finance-control-horizontal.png'
            alt='Finance Control'
            fill
            priority
            sizes='192px'
            className='scale-110 object-contain object-left'
          />
        </div>
      </div>

      <nav aria-label='Navegação principal' className='space-y-4'>
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
