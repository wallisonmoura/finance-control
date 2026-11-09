type Env = Record<string, string | undefined>;

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

// The base of links sent by e-mail. Never taken from the request's Host
// header: a forged Host would send the reset link to someone else's site.
// Each Vercel Preview (hml) has its own address, given by Vercel itself.
export function resolveAppBaseUrl(env: Env): string {
  if (env.VERCEL_ENV === 'production') {
    if (!env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL is not set in production');
    }

    return withoutTrailingSlash(env.NEXT_PUBLIC_APP_URL);
  }

  if (env.VERCEL_ENV === 'preview') {
    const host = env.VERCEL_BRANCH_URL ?? env.VERCEL_URL;

    if (host) {
      return `https://${withoutTrailingSlash(host)}`;
    }
  }

  return withoutTrailingSlash(env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
}
