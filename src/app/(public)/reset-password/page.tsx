import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/modules/auth/presentation/ui/components/reset-password-form';

export const metadata: Metadata = {
  title: 'Criar nova senha',
};

// The token comes after the # in the e-mail link and is read in the browser:
// it is never sent to the server, so it stays out of request logs.
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
