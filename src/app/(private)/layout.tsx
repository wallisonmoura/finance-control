import { getCurrentAuthenticatedUser } from '@/modules/auth/presentation/server/get-current-authenticated-user';
import { requireActiveSession } from '@/modules/auth/presentation/server/require-active-session';
import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { SignOutButton } from '@/modules/auth/presentation/ui/components/sign-out-button';
import { DebtsDueSoonBell } from '@/modules/debts/presentation/ui/components/debts-due-soon-bell';
import { getCurrentUserPendingDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { ThemeToggle } from '@/shared/presentation/ui/components/theme-toggle';
import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';
import { ReactNode } from 'react';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  // A login signed out by a password change or expired goes to the login
  // notice. Cached: the data helpers below reuse the same check.
  await requireActiveSession();

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
        mobileBarSlot={
          <DebtsDueSoonBell
            initialDebts={pendingDebts}
            initialError={pendingDebtsError}
          />
        }
        mobileUserSlot={
          <CurrentUserMenu
            initialUser={currentUser}
            initialError={currentUserError}
            showSignOut={false}
          />
        }
        mobileFooterSlot={<SignOutButton className='w-full justify-center' />}
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
