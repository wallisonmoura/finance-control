import { NextResponse } from 'next/server';

import {
  AUTH_COOKIE_NAME,
  AUTH_JWT_EXPIRES_IN,
} from '@/modules/auth/constants/auth.constants';
import { parseDurationToSeconds } from '@/shared/domain/duration/parse-duration-to-seconds';

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

// The cookie outlives the login by 7 days. The server refuses an expired login
// anyway; the leftover cookie only lets the login page say the session ended
// (the browser would otherwise drop it the moment the login expires).
// Computed when a cookie is set, not when the module loads: the proxy loads the
// auth constants on every request, so a misconfigured JWT_EXPIRES_IN breaks
// signing in, not every page.
export function getAuthCookieMaxAgeSeconds(): number {
  return parseDurationToSeconds(AUTH_JWT_EXPIRES_IN) + SEVEN_DAYS_IN_SECONDS;
}

const AUTH_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

export function setAuthCookie(response: NextResponse, accessToken: string): void {
  response.cookies.set({
    ...AUTH_COOKIE_OPTIONS,
    value: accessToken,
    maxAge: getAuthCookieMaxAgeSeconds(),
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({ ...AUTH_COOKIE_OPTIONS, value: '', maxAge: 0 });
}
