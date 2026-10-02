import { getCurrentAuthenticatedUser } from '@/modules/auth/presentation/server/get-current-authenticated-user';
import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { DebtsDueSoonBell } from '@/modules/debts/presentation/ui/components/debts-due-soon-bell';
import { getCurrentUserPendingDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { ThemeToggle } from '@/shared/presentation/ui/components/theme-toggle';
import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';
import { ReactNode } from 'react';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const [
    { data: currentUser, error: currentUserError },
    { data: pendingDebts, error: pendingDebtsError },
  ] = await Promise.all([
    getCurrentAuthenticatedUser(),
    getCurrentUserPendingDebts(),
  ]);

  return (
    <div className='min-h-dvh bg-background md:flex'>
      <PrivateNavigation
        currentUser={currentUser}
        currentUserError={currentUserError}
        initialPendingDebts={pendingDebts}
        initialPendingDebtsError={pendingDebtsError}
      />

      <div className='bg-app flex min-h-dvh min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-20 hidden h-24 bg-background/80 px-6 backdrop-blur-md md:block'>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-end'>
            <CurrentUserMenu
              initialUser={currentUser}
              initialError={currentUserError}
            >
              <ThemeToggle />
              <DebtsDueSoonBell
                initialDebts={pendingDebts}
                initialError={pendingDebtsError}
              />
            </CurrentUserMenu>
          </div>
        </header>

        <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-8 md:py-8 lg:px-10'>
          {children}
        </main>
      </div>
    </div>
  );
}
