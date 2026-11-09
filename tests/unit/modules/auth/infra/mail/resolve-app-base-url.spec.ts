import { resolveAppBaseUrl } from '@/modules/auth/infra/mail/resolve-app-base-url';

describe('resolveAppBaseUrl', () => {
  it('should use the configured address in production', () => {
    expect(
      resolveAppBaseUrl({ VERCEL_ENV: 'production', NEXT_PUBLIC_APP_URL: 'https://app.example.com/' }),
    ).toBe('https://app.example.com');
  });

  // A reset link pointing to localhost would be broken for every user.
  it('should refuse production without the configured address', () => {
    expect(() => resolveAppBaseUrl({ VERCEL_ENV: 'production' })).toThrow(
      'NEXT_PUBLIC_APP_URL is not set in production',
    );
  });

  it("should use the preview's own address on a preview deployment", () => {
    expect(
      resolveAppBaseUrl({
        VERCEL_ENV: 'preview',
        VERCEL_BRANCH_URL: 'app-git-feat.vercel.app',
        VERCEL_URL: 'app-abc123.vercel.app',
        NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      }),
    ).toBe('https://app-git-feat.vercel.app');
  });

  it('should fall back to the deployment address on a preview without a branch address', () => {
    expect(resolveAppBaseUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'app-abc123.vercel.app' })).toBe(
      'https://app-abc123.vercel.app',
    );
  });

  it('should use the configured address locally, or localhost', () => {
    expect(resolveAppBaseUrl({ NEXT_PUBLIC_APP_URL: 'http://localhost:4000' })).toBe('http://localhost:4000');
    expect(resolveAppBaseUrl({})).toBe('http://localhost:3000');
  });
});
