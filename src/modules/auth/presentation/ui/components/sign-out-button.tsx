'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LogOut } from 'lucide-react';

import { signOut } from '../services/auth-api.service';
import { Button } from '@/shared/presentation/ui/components/button';

export function SignOutButton() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    await signOut();

    setIsLoading(false);

    router.replace('/login');
    router.refresh();
  }

  return (
    <Button
      type='button'
      onClick={handleSignOut}
      disabled={isLoading}
      variant='secondary'
      className='h-11 shrink-0 gap-2 rounded-lg border-0 bg-white px-4 text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-950'
    >
      {isLoading ? (
        <LoaderCircle aria-hidden='true' className='size-4 animate-spin' />
      ) : (
        <LogOut aria-hidden='true' className='size-4' />
      )}
      {isLoading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}
