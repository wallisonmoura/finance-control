'use client';

import { useRouter } from 'next/navigation';

import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { AuthenticatedUser } from '../types/auth-ui.types';
import { ChangePasswordForm } from './change-password-form';
import { UpdateProfileForm } from './update-profile-form';

type AccountPageContentProps = {
  initialUser?: AuthenticatedUser | null;
  initialError?: string | null;
};

export function AccountPageContent({
  initialUser = null,
  initialError = null,
}: AccountPageContentProps) {
  const router = useRouter();

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Conta'
        description='Gerencie os dados da sua conta.'
      />

      {!initialUser ? (
        <LoadErrorState
          message={initialError ?? 'Não foi possível carregar sua conta.'}
          onRetry={() => router.refresh()}
        />
      ) : (
        <div className='grid gap-6 lg:grid-cols-2'>
          <UpdateProfileForm user={initialUser} />
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
}
