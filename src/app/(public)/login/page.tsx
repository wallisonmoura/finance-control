import type { Metadata } from 'next';
import { LoginForm } from '@/modules/auth/presentation/ui/components/login-form';

export const metadata: Metadata = {
  title: 'Entrar',
};

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    reset?: string;
    session?: string;
  }>;
};

function normalizeRedirectTo(redirectTo?: string) {
  if (!redirectTo) {
    return '/';
  }

  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/';
  }

  return redirectTo;
}

function getLoginNotice({ reset, session }: { reset?: string; session?: string }) {
  if (reset === 'success') {
    return 'password-reset';
  }

  if (session === 'expired') {
    return 'session-ended';
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, reset, session } = await searchParams;

  const safeRedirectTo = normalizeRedirectTo(redirectTo);

  return (
    <LoginForm
      redirectTo={safeRedirectTo}
      notice={getLoginNotice({ reset, session })}
    />
  );
}
