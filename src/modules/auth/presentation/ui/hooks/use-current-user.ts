'use client';

import { useEffect, useState } from 'react';
import { AuthenticatedUser } from '../types/auth-ui.types';
import { getCurrentUser } from '../services/auth-api.service';

type UseCurrentUserState = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useCurrentUser(): UseCurrentUserState {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const result = await getCurrentUser();

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setErrorMessage(result.error);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(result.data?.user ?? null);
      setErrorMessage(null);
      setIsLoading(false);
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    errorMessage,
  };
}
