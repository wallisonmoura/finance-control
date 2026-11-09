import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/modules/auth/presentation/ui/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Esqueci minha senha',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
