import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import {
  clearAuthCookie,
  getAuthCookieMaxAgeSeconds,
  setAuthCookie,
} from '@/modules/auth/presentation/http/helpers/auth-cookie';
import { parseDurationToSeconds } from '@/shared/domain/duration/parse-duration-to-seconds';

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

describe('auth cookie', () => {
  // The server refuses the expired login anyway; the cookie outlives it only
  // so the login page can say the session ended.
  it('should keep the cookie 7 days longer than the login', () => {
    expect(getAuthCookieMaxAgeSeconds()).toBe(
      parseDurationToSeconds(process.env.JWT_EXPIRES_IN ?? '7d') + SEVEN_DAYS_IN_SECONDS,
    );
  });

  it('should set the auth cookie with the login', () => {
    const response = NextResponse.json({});

    setAuthCookie(response, 'access-token');

    const cookie = response.cookies.get(AUTH_COOKIE_NAME);
    expect(cookie).toMatchObject({
      value: 'access-token',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: getAuthCookieMaxAgeSeconds(),
    });
  });

  it('should clear the cookie', () => {
    const response = NextResponse.json({});

    clearAuthCookie(response);

    expect(response.cookies.get(AUTH_COOKIE_NAME)).toMatchObject({ value: '', maxAge: 0 });
  });
});

describe('auth constants', () => {
  // The proxy loads this module on every request: a misconfigured login
  // lifetime must not take down every page, only setting the cookie.
  it('should load with a login lifetime the cookie parser does not understand', async () => {
    const previous = process.env.JWT_EXPIRES_IN;
    process.env.JWT_EXPIRES_IN = '1w';

    try {
      await expect(
        jest.isolateModulesAsync(async () => {
          await import('@/modules/auth/constants/auth.constants');
        }),
      ).resolves.toBeUndefined();
    } finally {
      process.env.JWT_EXPIRES_IN = previous;
    }
  });
});
