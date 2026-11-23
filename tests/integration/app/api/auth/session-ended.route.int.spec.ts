// The session check itself (token + password change) is covered by
// resolve-session.use-case tests; here it only says whether the login is valid.
jest.mock('@/modules/auth/infra/factories/make-resolve-session-use-case', () => ({
  makeResolveSessionUseCase: jest.fn(),
}));

import { NextRequest } from 'next/server';

import { GET } from '@/app/api/auth/session-ended/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';

const resolveSession = jest.fn();

(makeResolveSessionUseCase as jest.Mock).mockImplementation(() => ({
  execute: resolveSession,
}));

function makeRequest(token?: string) {
  return new NextRequest('http://localhost:3000/api/auth/session-ended', {
    headers: token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : undefined,
  });
}

describe('GET /api/auth/session-ended', () => {
  afterEach(() => {
    resolveSession.mockReset();
  });

  it('should clear the cookie and redirect to the login notice without a cookie', async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?session=expired');
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toMatchObject({ value: '', maxAge: 0 });
    expect(resolveSession).not.toHaveBeenCalled();
  });

  it('should clear the cookie and redirect to the login notice when the session ended', async () => {
    resolveSession.mockResolvedValue(null);

    const response = await GET(makeRequest('old-token'));

    expect(resolveSession).toHaveBeenCalledWith('old-token');
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?session=expired');
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toMatchObject({ value: '', maxAge: 0 });
  });

  // A link on another site, or a request sent before a password change in
  // Account, must not sign out a login that is still valid.
  it('should keep a valid login and go to the dashboard', async () => {
    resolveSession.mockResolvedValue('user-1');

    const response = await GET(makeRequest('valid-token'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toBeUndefined();
  });
});
