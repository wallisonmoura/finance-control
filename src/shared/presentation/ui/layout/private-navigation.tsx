'use client';

import { usePathname } from 'next/navigation';

import { DesktopSidebar } from './desktop-sidebar';
import { MobileMenu } from './mobile-menu';

export function PrivateNavigation() {
  const pathname = usePathname();

  return (
    <>
      <DesktopSidebar pathname={pathname} />
      <MobileMenu pathname={pathname} />
    </>
  );
}
