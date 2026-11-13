import { redirect } from 'next/navigation';

import { SESSION_ENDED_URL } from '@/shared/presentation/http/session-ended';
import { getAuthenticatedUserId } from './get-authenticated-user-id';

// For the private layout. The proxy only lets a private page through with a
// cookie, so no valid session here means a login signed out by a password
// change or expired: leave for the login notice instead of rendering empty
// blocks.
export async function requireActiveSession(): Promise<string> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(SESSION_ENDED_URL);
  }

  return userId;
}
