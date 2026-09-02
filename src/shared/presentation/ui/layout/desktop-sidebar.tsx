import Image from 'next/image';

import { isNavigationItemActive } from './is-navigation-item-active';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { NavigationLink } from './navigation-link';

type DesktopSidebarProps = {
  pathname: string;
};

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  return (
    <aside className='sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-4 text-foreground shadow-xl shadow-border/70 md:block'>
      <div className='mb-7 border-b border-border pb-4'>
        <div className='relative h-16 w-full overflow-hidden'>
          <Image
            src='/images/logo-finance-control-light.png'
            alt='Finance Control'
            fill
            priority
            sizes='192px'
            className='object-contain object-left dark:hidden'
          />
          <Image
            src='/images/logo-finance-control-dark.png'
            alt='Finance Control'
            fill
            priority
            sizes='192px'
            className='hidden object-contain object-left dark:block'
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
