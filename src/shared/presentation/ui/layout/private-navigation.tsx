'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { DesktopSidebar } from './desktop-sidebar';
import { MobileMenu } from './mobile-menu';

type PrivateNavigationProps = {
  // Built by the layout from other modules; see MobileMenu.
  mobileBarSlot?: ReactNode;
  mobileUserSlot?: ReactNode;
  mobileFooterSlot?: ReactNode;
};

export function PrivateNavigation({
  mobileBarSlot,
  mobileUserSlot,
  mobileFooterSlot,
}: PrivateNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <DesktopSidebar pathname={pathname} />
      <MobileMenu
        pathname={pathname}
        barSlot={mobileBarSlot}
        userSlot={mobileUserSlot}
        footerSlot={mobileFooterSlot}
      />
    </>
  );
}
