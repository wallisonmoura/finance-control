import { AUTH_UNAUTHORIZED_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { SESSION_ENDED_HEADER } from '@/shared/presentation/http/session-ended';
import { NextResponse } from 'next/server';

// No valid login (missing, expired or signed out by a password change). Marked
// so the app takes the user to the login notice. The cookie is left alone: a
// request sent before a password change in Account would otherwise erase the
// new login. GET /api/auth/session-ended clears it after checking the session.
export function unauthorizedResponse(message = AUTH_UNAUTHORIZED_MESSAGE) {
  return NextResponse.json(
    { message },
    { status: 401, headers: { [SESSION_ENDED_HEADER]: '1' } },
  );
}
