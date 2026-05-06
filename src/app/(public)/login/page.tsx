import { LoginForm } from '@/modules/auth/presentation/ui/components/login-form';

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

function normalizeRedirectTo(redirectTo?: string) {
  if (!redirectTo) {
    return '/dashboard';
  }

  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/dashboard';
  }

  return redirectTo;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  const safeRedirectTo = normalizeRedirectTo(redirectTo);

  return (
    <main className='flex min-h-screen items-center justify-center px-4 py-8'>
      <LoginForm redirectTo={safeRedirectTo} />
    </main>
  );
}
