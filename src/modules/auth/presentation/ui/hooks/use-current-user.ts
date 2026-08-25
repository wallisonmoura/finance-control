'use client';

import { useEffect, useState } from 'react';
import { AuthenticatedUser } from '../types/auth-ui.types';
import { getCurrentUser } from '../services/auth-api.service';

type UseCurrentUserState = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  errorMessage: string | null;
};

type UseCurrentUserParams = {
  initialUser?: AuthenticatedUser | null;
  initialError?: string | null;
};

export function useCurrentUser(
  params?: UseCurrentUserParams,
): UseCurrentUserState {
  const { initialUser = null, initialError = null } = params ?? {};
  const hasInitialResult = Boolean(initialUser || initialError);
  const [user, setUser] = useState<AuthenticatedUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!hasInitialResult);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  // Keeps state in sync when the parent Server Component re-fetches (e.g.
  // after router.refresh() following a profile update) and passes a new
  // initialUser prop — useState(initialUser) above only applies on mount,
  // it never reacts to a later prop change on its own.
  useEffect(() => {
    if (!hasInitialResult) {
      return;
    }

    setUser(initialUser);
    setErrorMessage(initialError);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser, initialError]);

  useEffect(() => {
    if (hasInitialResult) {
      return;
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLoading,
    errorMessage,
  };
}
