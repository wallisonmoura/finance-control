'use client';

import { ReactNode } from 'react';
import { UserRound } from 'lucide-react';

import { useCurrentUser } from '../hooks/use-current-user';
import { AuthenticatedUser } from '../types/auth-ui.types';
import { SignOutButton } from './sign-out-button';

type CurrentUserMenuProps = {
  initialUser?: AuthenticatedUser | null;
  initialError?: string | null;
  showSignOut?: boolean;
  children?: ReactNode;
};

export function CurrentUserMenu({
  initialUser = null,
  initialError = null,
  showSignOut = true,
  children,
}: CurrentUserMenuProps) {
  const { user, isLoading } = useCurrentUser({ initialUser, initialError });

  return (
    <div className='flex w-full items-center justify-between gap-4 px-0 py-0 md:w-auto md:min-w-80 md:justify-between'>
      <div className='flex min-w-0 items-center gap-3'>
        <div
          aria-hidden='true'
          className='flex size-12 shrink-0 items-center justify-center rounded-full bg-success-light text-accent ring-1 ring-accent/30'
        >
          <UserRound className='size-6' />
        </div>

        <div className='min-w-0'>
          <p className='text-sm text-muted-foreground'>Usuário</p>

          <p className='max-w-48 truncate text-base font-semibold text-foreground'>
            {isLoading ? 'Carregando...' : (user?.name ?? 'Usuário')}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        {children}
        {showSignOut ? <SignOutButton /> : null}
      </div>
    </div>
  );
}
