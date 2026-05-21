'use client';

import { UserRound } from 'lucide-react';

import { useCurrentUser } from '../hooks/use-current-user';
import { SignOutButton } from './sign-out-button';

export function CurrentUserMenu() {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className='flex w-full items-center justify-between gap-3 md:w-auto md:justify-end'>
      <div className='flex min-w-0 items-center gap-3'>
        <div
          aria-hidden='true'
          className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600'
        >
          <UserRound className='size-4' />
        </div>

        <div className='min-w-0 md:text-right'>
          <p className='text-xs text-slate-500'>Usuário</p>

          <p className='max-w-48 truncate text-sm font-semibold text-slate-950'>
            {isLoading ? 'Carregando...' : (user?.name ?? 'Usuário')}
          </p>
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
