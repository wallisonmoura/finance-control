import { NextRequest } from 'next/server';

import { GET } from '@/app/api/auth/session-ended/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';

describe('GET /api/auth/session-ended', () => {
  it('should clear the cookie and redirect to the login notice', async () => {
    const response = await GET(new NextRequest('http://localhost:3000/api/auth/session-ended'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?session=expired');
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toMatchObject({ value: '', maxAge: 0 });
  });
});
