import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Cached per request: the layout and the page ask for it, the database is
// checked once.
export const getAuthenticatedUserId = cache(
  async (): Promise<string | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

    if (!token) {
      return null;
    }

    return makeResolveSessionUseCase().execute(token);
  },
);
