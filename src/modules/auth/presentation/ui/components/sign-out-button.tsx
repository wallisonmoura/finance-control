'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <Button type='button' onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}
