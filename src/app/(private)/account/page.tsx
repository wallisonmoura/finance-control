import type { Metadata } from 'next';

import { getCurrentAuthenticatedUser } from '@/modules/auth/presentation/server/get-current-authenticated-user';
import { AccountPageContent } from '@/modules/auth/presentation/ui/components/account-page-content';

export const metadata: Metadata = {
  title: 'Conta',
};

export default async function AccountPage() {
  const { data, error } = await getCurrentAuthenticatedUser();

  return <AccountPageContent initialUser={data} initialError={error} />;
}
