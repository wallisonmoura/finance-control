'use client';

import { usePathname } from 'next/navigation';

import { AuthenticatedUser } from '@/modules/auth/presentation/ui/types/auth-ui.types';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

import { DesktopSidebar } from './desktop-sidebar';
import { MobileMenu } from './mobile-menu';

type PrivateNavigationProps = {
  currentUser?: AuthenticatedUser | null;
  currentUserError?: string | null;
  initialPendingDebts?: DebtUi[];
  initialPendingDebtsError?: string | null;
};

export function PrivateNavigation({
  currentUser = null,
  currentUserError = null,
  initialPendingDebts = [],
  initialPendingDebtsError = null,
}: PrivateNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <DesktopSidebar pathname={pathname} />
      <MobileMenu
        pathname={pathname}
        currentUser={currentUser}
        currentUserError={currentUserError}
        initialPendingDebts={initialPendingDebts}
        initialPendingDebtsError={initialPendingDebtsError}
      />
    </>
  );
}
