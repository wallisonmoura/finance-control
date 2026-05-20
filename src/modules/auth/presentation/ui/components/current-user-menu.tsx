'use client';

import { useCurrentUser } from '../hooks/use-current-user';
import { SignOutButton } from './sign-out-button';

export function CurrentUserMenu() {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className='flex items-center gap-3'>
      <div className='text-right'>
        <p className='text-xs text-slate-500'>Usuário</p>

        <p className='max-w-40 truncate text-sm font-semibold text-slate-950'>
          {isLoading ? 'Carregando...' : (user?.name ?? 'Usuário')}
        </p>
      </div>

      <SignOutButton />
    </div>
  );
}
