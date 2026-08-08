import { POST } from '@/app/api/auth/sign-out/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';

describe('POST /api/auth/sign-out', () => {
  it('should clear the authentication cookie', async () => {
    const response = await POST();
    const setCookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);
    expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(setCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
  });
});
