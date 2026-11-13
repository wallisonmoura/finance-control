import { clearAuthCookie } from '@/modules/auth/presentation/http/helpers/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';

// Where a page or the app sends a login that is no longer valid: clears the
// cookie (a page cannot) and shows the "session ended" notice on the login.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login?session=expired', request.url));

  clearAuthCookie(response);

  return response;
}
