import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/modules/auth/presentation/ui/components/reset-password-form';

export const metadata: Metadata = {
  title: 'Criar nova senha',
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return <ResetPasswordForm token={typeof token === 'string' && token ? token : null} />;
}
